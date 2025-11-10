# 🗄️ MongoDB Atlas Setup Guide for Mintapply

## Step 1: Create MongoDB Atlas Account & Cluster

### 1.1 Sign up for MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account (no credit card required)
3. Verify your email

### 1.2 Create a Free Cluster
1. Click **"Build a Database"** or **"Create"**
2. Choose **M0 (Free tier)** - 512MB storage
3. Select a cloud provider & region close to you:
   - **AWS** / **Google Cloud** / **Azure**
   - Choose region (e.g., London, Frankfurt for EU)
4. Name your cluster (e.g., `mintapply-cluster`)
5. Click **"Create Cluster"** (takes 1-3 minutes)

---

## Step 2: Configure Database Access

### 2.1 Create Database User
1. Go to **Security** → **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication method
4. Enter credentials:
   - **Username**: `mintapply_admin` (or your choice)
   - **Password**: Click **"Autogenerate Secure Password"** and **COPY IT**
     - Example: `xK9mP2nQ7vR4sT8u`
5. **Database User Privileges**: Choose **"Read and write to any database"**
6. Click **"Add User"**

### 2.2 Whitelist IP Address
1. Go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. **For development**, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, add only your server's IP
4. Click **"Confirm"**

---

## Step 3: Get Your Connection String

### 3.1 Get MongoDB URI
1. Go to **Database** → **Clusters**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 3.2 Replace Placeholders
Replace `<username>` and `<password>` with your actual credentials:

**Example:**
```
Original:
mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority

After replacement (username: mintapply_admin, password: xK9mP2nQ7vR4sT8u):
mongodb+srv://mintapply_admin:xK9mP2nQ7vR4sT8u@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **Important**: If your password contains special characters (@, :, /, etc.), you must URL-encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`

You can use this tool: https://www.urlencoder.org/

---

## Step 4: Update Your .env File

Open `backend/.env` and replace the MONGO_URI line with your connection string:

```env
PORT=3001
MONGO_URI=mongodb+srv://mintapply_admin:xK9mP2nQ7vR4sT8u@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=060c44139ae9bcc6e43cf39bf5f7e0cdff8d55ffe101d65fedbd3b09d3273b1c66fe4e6c68bcced3eed3d3f04c6b57992a078d7c8687658afb22d12741854256
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ALLOWED_ORIGIN=http://localhost:5174
```

---

## Step 5: Seed Database with Redeem Codes

Run the seed script to populate initial redeem codes:

```bash
cd backend
npm run seed
```

This will create:
- `MINT25` → 25 tokens
- `MINT100` → 100 tokens
- `WELCOME10` → 10 tokens
- `TEST5` → 5 tokens

---

## Step 6: Start Your Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.abc123.mongodb.net
Mintapply backend running on :3001
```

---

## Step 7: Test the Connection

### Test Registration
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Test Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🎯 What Changed

### Before (JSON File):
- ❌ Data stored in `db.json` file
- ❌ Lost on server restart
- ❌ No scalability
- ❌ No data relationships

### After (MongoDB Atlas):
- ✅ Cloud database (always available)
- ✅ Persistent data
- ✅ Scalable & secure
- ✅ Proper user/code models
- ✅ Free tier: 512MB storage

---

## 📊 View Your Data in MongoDB Atlas

1. Go to **Database** → **Browse Collections**
2. You'll see:
   - **users** collection - All registered users
   - **redeemcodes** collection - All redemption codes

---

## 🔧 Troubleshooting

### Error: "MongoServerError: bad auth"
- ✅ Check username/password in connection string
- ✅ Make sure password is URL-encoded if it has special characters

### Error: "connection timeout"
- ✅ Check Network Access in MongoDB Atlas
- ✅ Make sure 0.0.0.0/0 is whitelisted (or your IP)

### Error: "MONGO_URI not configured"
- ✅ Make sure .env file is in the `backend` folder
- ✅ Check that the variable name is exactly `MONGO_URI`

---

## 🚀 You're All Set!

Your Mintapply backend is now using MongoDB Atlas! Users can:
- ✅ Register accounts (stored in MongoDB)
- ✅ Login with JWT tokens
- ✅ Redeem codes for tokens
- ✅ Generate cover letters (tokens deducted from MongoDB)
- ✅ Data persists across server restarts

**Next**: Test your frontend at http://localhost:5173 and try registering!
