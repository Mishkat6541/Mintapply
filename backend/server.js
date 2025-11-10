
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import OpenAI from 'openai';
import { generateToken, hashPassword, comparePassword } from './auth.js';
import { authenticateToken } from './middleware.js';
import connectDB from './config/database.js';
import User from './models/User.js';
import RedeemCode from './models/RedeemCode.js';

// Debug logging
console.log('🔧 Environment check:');
console.log('PORT:', process.env.PORT);
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY (first 20 chars):', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');
console.log('ALLOWED_ORIGIN:', process.env.ALLOWED_ORIGIN);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Connect to MongoDB
await connectDB();

const app = express();
app.use(morgan('tiny'));
app.use(express.json({ limit: '1mb' }));
app.use(cors({ 
  origin: true, // Allow all origins for debugging
  credentials: true 
}));

// Health
app.get('/health', (req,res)=>res.json({ok:true}));

// ===== AUTHENTICATION ENDPOINTS =====

// Register new user
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
      tokens: 0
    });
    
    // Generate token
    const token = generateToken({ 
      uid: user._id.toString(), 
      email: user.email, 
      name: user.name 
    });
    
    console.log('✅ User registered:', email);
    res.json({
      token,
      user: {
        email: user.email,
        name: user.name,
        tokens: user.tokens
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken({ 
      uid: user._id.toString(), 
      email: user.email, 
      name: user.name 
    });
    
    console.log('✅ User logged in:', email);
    res.json({
      token,
      user: {
        email: user.email,
        name: user.name,
        tokens: user.tokens
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info (protected route)
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      email: user.email,
      name: user.name,
      tokens: user.tokens
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ===== END AUTHENTICATION ENDPOINTS =====

// ===== STRIPE PAYMENT ENDPOINTS =====

// Create Stripe Checkout Session
app.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { packageType } = req.body; // 'small', 'medium', 'large'
    const userEmail = req.user.email;

    // Define token packages
    const packages = {
      small: { tokens: 50, price: 500 }, // £5.00 for 50 tokens
      medium: { tokens: 150, price: 1000 }, // £10.00 for 150 tokens
      large: { tokens: 500, price: 2500 } // £25.00 for 500 tokens
    };

    const selectedPackage = packages[packageType];
    if (!selectedPackage) {
      return res.status(400).json({ error: 'Invalid package type' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${selectedPackage.tokens} Mintapply Tokens`,
              description: `Generate ${selectedPackage.tokens} AI cover letters`,
              images: ['https://i.imgur.com/placeholder.png'], // Add your logo URL
            },
            unit_amount: selectedPackage.price, // Amount in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.ALLOWED_ORIGIN || 'http://localhost:5174'}?payment=success`,
      cancel_url: `${process.env.ALLOWED_ORIGIN || 'http://localhost:5174'}?payment=cancelled`,
      customer_email: userEmail,
      metadata: {
        userId: req.user.uid,
        userEmail: userEmail,
        tokens: selectedPackage.tokens.toString(),
      },
    });

    console.log('✅ Checkout session created for', userEmail, ':', selectedPackage.tokens, 'tokens');
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook to grant tokens after successful payment
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const userEmail = session.metadata.userEmail;
      const tokensToAdd = parseInt(session.metadata.tokens);

      console.log('💰 Payment successful for', userEmail, '- adding', tokensToAdd, 'tokens');

      // Find user and add tokens
      const user = await User.findOne({ email: userEmail });
      if (user) {
        user.tokens += tokensToAdd;
        await user.save();
        console.log('✅ Tokens added! New balance:', user.tokens);
      } else {
        console.error('❌ User not found:', userEmail);
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
    }
  }

  res.json({ received: true });
});

// ===== END STRIPE PAYMENT ENDPOINTS =====

// Redeem code -> adds tokens and returns balance (protected)
app.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body || {};
    const email = req.user.email;
    
    if (!code) return res.status(400).json({ error: 'Missing code' });
    
    // Find the redeem code
    const redeemCode = await RedeemCode.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!redeemCode) {
      return res.status(400).json({ error: 'Invalid or already used code' });
    }
    
    // Find user and add tokens
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.tokens += redeemCode.tokens;
    await user.save();
    
    // Mark code as used
    redeemCode.isActive = false;
    redeemCode.usedBy = user._id;
    redeemCode.usedAt = new Date();
    await redeemCode.save();
    
    console.log('✅ Code redeemed:', code, 'by', email, 'for', redeemCode.tokens, 'tokens');
    return res.json({ tokens: user.tokens });
  } catch (error) {
    console.error('❌ Redeem error:', error);
    res.status(500).json({ error: 'Redemption failed' });
  }
});

// LLM generation endpoint: consumes 1 token and returns letter text (protected)
app.post('/v1/generate', authenticateToken, async (req, res) => {
  try {
    const { title = '', jd = '' } = req.body || {};
    const email = req.user.email;
    
    console.log('🤖 Cover letter generation request:', { title, jd: jd.substring(0, 100) + '...', email });
    
    // Find user and check tokens
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('💰 Current balance for', email, ':', user.tokens);
    
    if (user.tokens <= 0) {
      console.log('❌ No tokens available for', email);
      return res.status(402).json({ error: 'No tokens' });
    }
    
    // Deduct token
    user.tokens -= 1;
    await user.save();
    console.log('✅ Token consumed successfully, new balance:', user.tokens);

    // Generate cover letter
    try {
      console.log('🧠 Generating cover letter with OpenAI...');
      const prompt = `You are Mintapply, generating a 1-page professional cover letter. 

Applicant: ${user.name}
Role: ${title}
Job description:
${jd}

Write a concise, confident cover letter tailored to this job description. Use UK English, professional but warm tone. Keep it under 300-350 words. Include a paragraph referencing specific responsibilities/requirements from the JD. End with a polite call-to-action. Format it as a proper letter with the applicant's name at the top and signature at the bottom.`;

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
      console.log('✅ Cover letter generated successfully, length:', text.length);
      return res.json({ text, tokensRemaining: user.tokens });
    } catch (e) {
      // Refund token on error
      user.tokens += 1;
      await user.save();
      console.error('❌ OpenAI API error:', e.message);
      console.error('Error details:', e);
      return res.status(500).json({ error: 'LLM error: ' + e.message });
    }
  } catch (error) {
    console.error('❌ Generate endpoint error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Mintapply backend running on :${port}`));
