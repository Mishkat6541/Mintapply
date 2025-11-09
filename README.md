# Mintapply - Job Applications on Autopilot

A modern landing page and backend system for the Mintapply Chrome extension that automates job applications with AI-powered cover letter generation.

## 🚀 Features

- **Frontend Landing Page**: Beautiful, responsive React website built with Vite and Tailwind CSS
- **Backend API**: Express.js server with token management and OpenAI integration
- **Live Demo**: Interactive cover letter generation and token redemption
- **Stripe Integration**: Ready for payment processing
- **Real-time Status**: Backend health monitoring

## 🏗️ Project Structure

```
Mintapply/
├── frontend/
│   ├── src/
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Tailwind CSS imports
│   ├── MintapplyLanding.jsx  # Main landing page component
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── backend/
│   ├── server.js             # Express server
│   ├── db.json              # Simple JSON database
│   ├── .env                 # Environment variables
│   └── package.json         # Backend dependencies
└── start-dev.sh             # Development startup script
```

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18+)
- WSL2 or Linux environment
- OpenAI API key (for cover letter generation)

### 1. Environment Setup

Copy the example environment file and configure:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=3001
OPENAI_API_KEY=sk-your_openai_api_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
ALLOWED_ORIGIN=http://localhost:5173
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..
```

### 3. Start Development Servers

Option A - Use the convenience script:
```bash
./start-dev.sh
```

Option B - Start manually:
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🎯 Testing the Integration

### Token Redemption
Use these test codes in the "Redeem Code" section:
- `MINT10` - 10 tokens
- `MINT25` - 25 tokens  
- `MINT100` - 100 tokens

### Cover Letter Generation
1. Redeem a code to get tokens
2. Fill in job title and description in the demo
3. Click "Generate Cover Letter" (consumes 1 token)

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |
| POST | `/redeem` | Redeem token codes |
| POST | `/v1/generate` | Generate cover letter |
| GET | `/checkout` | Redirect to Stripe checkout |
| POST | `/stripe/webhook` | Stripe webhook handler |

## 🎨 Customization

### Frontend Styling
The project uses Tailwind CSS with a custom mint color palette defined in `MintapplyLanding.jsx`:

```javascript
const mint = {
  bg: "#0f172a",
  light: "#e6fff5", 
  tint: "#b7fbe3",
  mid: "#7ef5cf",
  brand: "#22D3A9",
  deep: "#0ea37a",
};
```

### Backend Configuration
- Modify `server.js` for additional API endpoints
- Update `db.json` for different redemption codes
- Configure Stripe settings in `.env`

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku)
1. Set environment variables in your hosting platform
2. Ensure CORS_ORIGIN points to your frontend domain
3. Set up Stripe webhooks for production

## 🧪 Development Notes

- **CORS**: Backend configured to allow requests from localhost:5173
- **Hot Reload**: Both frontend and backend support live reloading
- **Error Handling**: API includes proper error responses and status codes
- **Token System**: Simple file-based storage (replace with database for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the integration
5. Submit a pull request

## 📄 License

This project is for educational/demonstration purposes. Ensure you have proper API keys and follow OpenAI's usage policies.

---

**Built with ❤️ for job seekers everywhere**