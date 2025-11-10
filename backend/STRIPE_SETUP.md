# 💳 Stripe Payment Setup Guide

## ✅ What's Already Implemented

Your Mintapply app now has **full Stripe payment integration**:

### Backend Features:
- ✅ Stripe Checkout Session creation
- ✅ Three token packages (50, 150, 500 tokens)
- ✅ Webhook handler for payment confirmation
- ✅ Automatic token crediting after payment

### Frontend Features:
- ✅ Updated pricing page with 3 packages
- ✅ Buy buttons that redirect to Stripe Checkout
- ✅ Login requirement for purchases
- ✅ Beautiful pricing cards

---

## 🎯 Token Packages

| Package | Tokens | Price | Per Token |
|---------|--------|-------|-----------|
| Starter | 50 | £5.00 | 10p |
| Popular | 150 | £10.00 | 6.6p |
| Power | 500 | £25.00 | 5p |

---

## 🔧 Complete Stripe Setup (Test Mode)

### Step 1: Get Your Stripe Keys ✅ DONE

Your test key is already in `.env`:
```
STRIPE_SECRET_KEY=sk_test_51S1aLuDPkGcStLSb...
```

### Step 2: Set Up Webhook (IMPORTANT!)

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter your webhook URL**:
   - For local testing: `http://localhost:3001/stripe/webhook`
   - For production: `https://yourdomain.com/stripe/webhook`

4. **Select events to listen to**:
   - ✅ `checkout.session.completed`

5. **Click "Add endpoint"**

6. **Copy the Webhook Signing Secret**:
   - It starts with `whsec_...`
   - Add it to your `.env` file

7. **Update .env**:
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
```

---

## 🧪 Testing Payments (Local Development)

### Option 1: Use Stripe CLI (Recommended)

1. **Install Stripe CLI**:
   - Windows: `scoop install stripe`
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Linux: Download from https://stripe.com/docs/stripe-cli

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3001/stripe/webhook
   ```
   
4. **Copy the webhook secret** shown in terminal and update `.env`

5. **In another terminal, start your app**:
   ```bash
   cd backend
   npm run dev
   ```

### Option 2: Test Without Webhooks

- Payments will work
- Stripe will charge the card
- But tokens won't be added automatically
- You'll need to manually test with redeem codes

---

## 💳 Test Card Numbers

Use these cards on Stripe Checkout (TEST MODE ONLY):

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Declined |

- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## 🚀 How It Works

1. **User clicks "Buy 50 tokens"** on pricing page
2. **Frontend calls** `/create-checkout-session` with package type
3. **Backend creates** Stripe Checkout session with user's email
4. **User redirected** to Stripe payment page
5. **User enters** card details and completes payment
6. **Stripe sends webhook** to `/stripe/webhook`
7. **Backend adds tokens** to user's MongoDB account
8. **User redirected** back to your site with success message

---

## ✅ Success URL Handling

After payment, users are redirected to:
```
http://localhost:5174?payment=success
```

You can add a success message in your frontend:

```javascript
// Add to MintapplyLanding.jsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment') === 'success') {
    alert('🎉 Payment successful! Your tokens have been added.');
    window.history.replaceState({}, '', '/');
  }
}, []);
```

---

## 📊 Monitor Payments

1. **Stripe Dashboard**: https://dashboard.stripe.com/test/payments
2. **See all test payments, refunds, disputes**
3. **View webhook logs**
4. **Check customer data**

---

## 🔴 Going Live (Production)

1. **Get live API keys** from Stripe Dashboard
2. **Update .env** with live keys:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   ```
3. **Set up live webhook** endpoint
4. **Update success/cancel URLs** to production domain
5. **Test with real card** (small amount)
6. **Activate your Stripe account** (business verification)

---

## 🛠️ Troubleshooting

### Webhook not receiving events:
- ✅ Check Stripe CLI is running (`stripe listen...`)
- ✅ Verify webhook secret in `.env`
- ✅ Check Stripe Dashboard webhook logs
- ✅ Ensure server is running on correct port

### Tokens not added after payment:
- ✅ Check backend logs for webhook errors
- ✅ Verify user email matches between Stripe and MongoDB
- ✅ Check MongoDB to see if tokens were added
- ✅ Run `npm run view-db` to check database

### Payment fails:
- ✅ Use test card numbers
- ✅ Check Stripe Dashboard for error details
- ✅ Verify STRIPE_SECRET_KEY is correct

---

## 🎉 You're All Set!

Your users can now:
- ✅ Register/login
- ✅ Purchase tokens via Stripe
- ✅ Redeem promo codes
- ✅ Generate AI cover letters
- ✅ See token balance in real-time

**Next**: Test the complete flow from registration to payment to cover letter generation!
