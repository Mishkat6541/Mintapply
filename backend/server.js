
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import OpenAI from 'openai';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(morgan('tiny'));
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

const DB_PATH = path.join(process.cwd(), 'db.json');
function loadDB(){
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}
function saveDB(db){
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
function getBalance(uid){
  const db = loadDB();
  return db.balances[uid] || 0;
}
function addTokens(uid, n){
  const db = loadDB();
  db.balances[uid] = (db.balances[uid] || 0) + n;
  saveDB(db);
  return db.balances[uid];
}
function consumeToken(uid){
  const db = loadDB();
  const cur = db.balances[uid] || 0;
  if (cur <= 0) throw new Error('No tokens');
  db.balances[uid] = cur - 1;
  saveDB(db);
  return db.balances[uid];
}

// Health
app.get('/health', (req,res)=>res.json({ok:true}));

// Checkout stub (replace with Stripe Checkout or Payment Links)
app.get('/checkout', async (req, res) => {
  // For demo, redirect to a Payment Link you set up in Stripe Dashboard
  const link = 'https://buy.stripe.com/test_1234567890abcdefghijkl';
  res.redirect(link);
});

// Redeem code -> adds tokens and returns balance
app.post('/redeem', (req, res) => {
  const { code, uid = 'anonymous' } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Missing code' });
  const db = loadDB();
  const amount = db.redeemCodes[code];
  if (!amount) return res.status(400).json({ error: 'Invalid code' });
  delete db.redeemCodes[code]; // one-time
  db.balances[uid] = (db.balances[uid] || 0) + amount;
  saveDB(db);
  return res.json({ tokens: db.balances[uid] });
});

// Webhook to grant tokens after successful Checkout (replace with real logic)
app.post('/stripe/webhook', express.raw({type:'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || 'anonymous';
    const qty = Number(session.metadata?.tokens || 10);
    addTokens(email, qty);
  }
  res.json({received: true});
});

// LLM generation endpoint: consumes 1 token and returns letter text
app.post('/v1/generate', async (req, res) => {
  const { title = '', jd = '', uid = 'anonymous' } = req.body || {};
  try {
    consumeToken(uid);
  } catch (e) {
    return res.status(402).json({ error: 'No tokens' });
  }

  try {
    const prompt = `You are Mintapply, generating a 1-page cover letter. Role: ${title}.
Company context: derive from JD if present.
Job description (may be long):
${jd}

Write a concise, confident cover letter for Mishkat Rahman Mazumder, CS undergrad (RHUL, 2026), with strengths in security, web apps, and automation. Use UK English, avoid buzzwords, keep it under 300-350 words. Include a short tailored paragraph referencing specific responsibilities/requirements inferred from the JD. End with a polite call-to-action.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write concise, tailored cover letters in UK English, professional but warm." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 600
    });

    const text = completion.choices[0].message.content.trim();
    return res.json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).send('LLM error');
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Mintapply backend running on :${port}`));
