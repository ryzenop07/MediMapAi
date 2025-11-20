# Alternative Deployment Options

## 🚀 Option 1: Vercel (Frontend Only - Recommended)

1. **Push to GitHub**
2. **Go to [vercel.com](https://vercel.com)**
3. **Import repo**
4. **Settings:**
   - Framework: `Other`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBUmdRvBbDk7ogouT_3sHccqgZpDAYrqJE
   ```

## 🚀 Option 2: Netlify + Railway

### Frontend (Netlify):
1. **Go to [netlify.com](https://netlify.com)**
2. **Connect GitHub**
3. **Auto-detects settings from netlify.toml**

### Backend (Railway):
1. **Go to [railway.app](https://railway.app)**
2. **Deploy from GitHub**
3. **Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://prajapativishal273212_db_user:ajay211stt@cluster0.xwrhopy.mongodb.net/
   JWT_SECRET=8e9fd2104e0dcfb8ffe6aa6c1e12757c
   PORT=3000
   CORS_ORIGIN=https://your-netlify-url.netlify.app
   ```

## 🚀 Option 3: Heroku

### Backend:
```bash
cd backend
heroku create medicine-finder-api
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a medicine-finder-api
git push heroku main
```

### Frontend:
```bash
cd frontend
heroku create medicine-finder-frontend
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
git init
git add .
git commit -m "Deploy frontend"
heroku git:remote -a medicine-finder-frontend
git push heroku main
```

## 🎯 Recommended: Vercel + Railway
- **Frontend**: Vercel (free, fast)
- **Backend**: Railway (free tier, easy setup)
- **Database**: Keep existing MongoDB Atlas