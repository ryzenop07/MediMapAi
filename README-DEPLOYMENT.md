# Medicine Finder - Render Deployment Guide

## 🚀 Deploy Backend (Web Service) + Frontend (Static Site)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for Render deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy Backend Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. **Settings**:
   - Name: `medicine-finder-api`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

### Step 3: Deploy Frontend Static Site
1. Click "New +" → "Static Site"
2. Connect same GitHub repo
3. **Settings**:
   - Name: `medicine-finder-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Step 4: Environment Variables

**Backend Web Service**:
- `MONGODB_URI`: `mongodb+srv://your-connection-string`
- `JWT_SECRET`: Generate random 32-char string
- `CORS_ORIGIN`: `https://medicine-finder-frontend.onrender.com`
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

**Frontend Static Site**:
- `VITE_API_BASE_URL`: `https://medicine-finder-api.onrender.com`
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## ✅ Clean Project Structure
```
medicine-finder/
├── backend/                    # Node.js API (Web Service)
│   ├── src/
│   ├── routes/
│   ├── Ai_module/
│   ├── server.js
│   └── package.json
├── frontend/                   # React App (Static Site)
│   ├── src/
│   │   ├── components/         # Moved from root
│   │   └── pages/
│   ├── public/
│   │   └── images/            # Moved from root
│   ├── dist/                  # Build output
│   └── package.json
└── render.yaml                # Auto-deploy config
```