# Mintapply JWT Authentication Setup

## 🔐 JWT Authentication Successfully Configured

Your codebase now has complete JWT authentication set up! Here's what was added:

### Files Created:
1. **`backend/auth.js`** - JWT utilities (token generation, verification, password hashing)
2. **`backend/middleware.js`** - Authentication middleware for protecting routes

### Changes Made:
1. ✅ Installed `jsonwebtoken` and `bcrypt` packages
2. ✅ Added user management to `db.json`
3. ✅ Created authentication endpoints in `server.js`
4. ✅ Protected `/v1/generate` and `/redeem` endpoints with JWT
5. ✅ Generated secure JWT secret (128 characters)

---

## 🔑 JWT Secret in .env

Your secure JWT secret has been added to `backend/.env`:

```env
JWT_SECRET=060c44139ae9bcc6e43cf39bf5f7e0cdff8d55ffe101d65fedbd3b09d3273b1c66fe4e6c68bcced3eed3d3f04c6b57992a078d7c8687658afb22d12741854256
```

**⚠️ IMPORTANT:** Keep this secret safe! Never commit it to version control.

---

## 📡 API Endpoints

### Authentication Endpoints:

#### 1. **Register** - `POST /auth/register`
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "name": "Your Name"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "name": "Your Name",
    "tokens": 0
  }
}
```

#### 2. **Login** - `POST /auth/login`
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "name": "Your Name",
    "tokens": 5
  }
}
```

#### 3. **Get Current User** - `GET /auth/me` (Protected)
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```
**Response:**
```json
{
  "email": "user@example.com",
  "name": "Your Name",
  "tokens": 5
}
```

### Protected Endpoints (require JWT):

#### 4. **Generate Cover Letter** - `POST /v1/generate` (Protected)
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```
**Body:**
```json
{
  "title": "Software Engineer",
  "jd": "Job description text here..."
}
```

#### 5. **Redeem Code** - `POST /redeem` (Protected)
**Headers:**
```
Authorization: Bearer <your-jwt-token>
```
**Body:**
```json
{
  "code": "MINT25"
}
```

---

## 🧪 Testing the API

### Using curl:

```bash
# Register a new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Use the token from login response
TOKEN="your-token-here"

# Get current user
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Generate cover letter
curl -X POST http://localhost:3001/v1/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Developer","jd":"Looking for a skilled developer..."}'

# Redeem code
curl -X POST http://localhost:3001/redeem \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"MINT25"}'
```

---

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens expire in 7 days
- ✅ Secure 128-character random secret
- ✅ Protected routes require valid JWT
- ✅ User-specific token balances

---

## 📝 Next Steps

1. **Update your frontend** to:
   - Store JWT token (localStorage or secure cookie)
   - Send token in Authorization header for all protected requests
   - Handle 401/403 errors (redirect to login)

2. **Add to `.gitignore`**:
   ```
   backend/.env
   ```

3. **For production**:
   - Use environment variables (not .env file)
   - Consider token refresh mechanism
   - Add rate limiting
   - Use HTTPS only

---

## 🎯 Token Flow

1. User registers/logs in → Receives JWT token
2. Frontend stores token
3. Frontend sends token with each request
4. Backend verifies token → Allows/denies access
5. User identity extracted from token (no need to pass `uid` manually)

---

**Your JWT system is ready to use!** 🚀
