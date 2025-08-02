# Simple Deployment Guide

## Deploy to Railway (Recommended - Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect it's a Node.js app and deploy

3. **Set Environment Variables** (in Railway dashboard)
   - `NODE_ENV=production`
   - `SESSION_SECRET=your-secret-key-here`

4. **That's it!** Your app will be live at `https://your-app-name.railway.app`

## Alternative: Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repo
5. Set build command: `npm run build`
6. Set start command: `npm start`
7. Deploy!

## What happens:
- Frontend gets built and served by the backend
- Database runs on Railway/Render's infrastructure
- App runs 24/7 with automatic restarts
- Free tier includes 500 hours/month (enough for 24/7)

## Default Login:
- Username: `anthony` Password: `admin123` (Admin)
- Username: `joep` Password: `user123` (User) 