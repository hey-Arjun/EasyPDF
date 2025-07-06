# 🚀 EasyPDF Deployment Guide

## Vercel + Railway Deployment

### Prerequisites
- GitHub repository with your EasyPDF code
- Vercel account (free)
- Railway account (free tier available)
- MongoDB Atlas database

---

## 📱 Frontend Deployment (Vercel)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository

### Step 2: Configure Build Settings
- **Framework Preset:** Create React App
- **Root Directory:** `./` (root of repository)
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/build`
- **Install Command:** `npm run install-all`

### Step 3: Environment Variables
Add these environment variables in Vercel:
```
REACT_APP_API_URL=https://your-railway-app.railway.app
```

### Step 4: Deploy
Click "Deploy" and wait for build to complete.

---

## 🔧 Backend Deployment (Railway)

### Step 1: Connect to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### Step 2: Configure Service
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Step 3: Environment Variables
Copy all variables from `server/env.production.template` to Railway environment variables:

```env
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=easypdf_secret
UPLOAD_MAX_SIZE=50mb
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-railway-app.railway.app/api/auth/google/callback
MONGODB_URI=your-mongodb-atlas-connection-string
```

### Step 4: Deploy
Railway will automatically deploy your backend.

---

## 🔗 Connect Frontend to Backend

### Update Google OAuth Callback URL
1. Go to Google Cloud Console
2. Update OAuth 2.0 credentials
3. Add your Railway callback URL:
   `https://your-railway-app.railway.app/api/auth/google/callback`

### Update Frontend API URL
1. In Vercel, update environment variable:
   `REACT_APP_API_URL=https://your-railway-app.railway.app`

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Backend health check passes: `https://your-railway-app.railway.app/health`
- [ ] User registration/login works
- [ ] Google OAuth works
- [ ] PDF upload/download works
- [ ] All PDF tools function properly

---

## 🛠️ Troubleshooting

### Common Issues:
1. **CORS Errors:** Check CORS configuration in `server/server.js`
2. **Build Failures:** Check build logs in Vercel
3. **Database Connection:** Verify MongoDB Atlas connection string
4. **Google OAuth:** Ensure callback URLs are correct

### Support:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Railway: [railway.app/docs](https://railway.app/docs)

---

## 💰 Cost Estimation

- **Vercel:** FREE (unlimited)
- **Railway:** $5/month (500 hours free, then $0.000463/hour)
- **MongoDB Atlas:** FREE tier available
- **Total:** ~$5/month for production-ready app 