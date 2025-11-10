# 🚀 Quick MongoDB Atlas Connection Steps

## 📋 Checklist

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Create Account** (free, no credit card)
3. **Create Free Cluster** (M0 tier, 512MB)
4. **Create Database User**:
   - Security → Database Access → Add User
   - Username: `mintapply_admin`
   - Password: Auto-generate (COPY IT!)
5. **Whitelist IP**:
   - Security → Network Access → Add IP
   - Allow 0.0.0.0/0 (for dev)
6. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy the `mongodb+srv://...` string
7. **Update .env**:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/
   ```
8. **Seed Database**:
   ```bash
   npm run seed
   ```
9. **Start Server**:
   ```bash
   npm run dev
   ```

## ✅ Success Indicators

You'll see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
Mintapply backend running on :3001
```

## 🎫 Default Redeem Codes

After seeding:
- `MINT25` → 25 tokens
- `MINT100` → 100 tokens
- `WELCOME10` → 10 tokens
- `TEST5` → 5 tokens

## 📝 Full Guide

See `MONGODB_SETUP.md` for detailed instructions!
