# Mintapply Token Backend (Starter)

A tiny Node/Express service that:
- Grants tokens after purchase or redeem
- Consumes one token per cover-letter generation
- Calls OpenAI to produce the letter text
- Exposes endpoints your extension can call securely

## Quick start
```bash
npm install
cp .env.example .env   # fill OPENAI_API_KEY, STRIPE keys if needed
npm run dev
# -> http://localhost:8787/health
```

## Endpoints
- `GET /checkout` -> redirects to a Stripe Payment Link (replace placeholder in `server.js`).
- `POST /redeem` { code, uid } -> adds tokens and returns `{ tokens }`.
- `POST /v1/generate` { title, jd, uid } -> **consumes 1 token** and returns `{ text }`.
- `POST /stripe/webhook` -> handles Checkout completion; attach tokens to `session.metadata.tokens` and customer email.

## Minimal security note
- In production, require an auth token or session to identify users (e.g., JWT, Firebase Auth).
- Replace the JSON `db.json` with a durable store (Postgres/SQLite/Firestore).
- Do not expose your OpenAI API key to the client; keep all LLM calls **server-side**.

## Wiring with the extension
- Set your deployed backend URL (e.g., `https://api.mintapply.com`) in the extension:
  - Manifest: `host_permissions` should include it.
  - `popup.js` Buy/Redeem URLs.
  - `background.js` uses `/v1/generate`.
- Pass `uid` (e.g., user's email) in the payload so tokens are tracked per user.

## Stripe
- Use Stripe Checkout or Payment Links. For webhooks, set the endpoint to `/stripe/webhook`.
- On session creation, include `metadata: { tokens: 25 }` to grant packs.
- You can map different products -> different token amounts.

---
This is a starter. Lock down auth, validation, and persistence before going live.
