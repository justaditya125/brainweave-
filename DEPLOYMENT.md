# Deployment Guide

## Backend (Render)

### 1. Create a Render account
Go to [render.com](https://render.com) and sign up.

### 2. Connect your GitHub repo
1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Select the `backend` folder as the root directory

### 3. Configure the service
- **Name:** `notes-app-backend`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run render-start`
- **Health Check Path:** `/health`

### 4. Add a database
1. Click **New** → **PostgreSQL** (or MySQL if available)
2. Note down the connection details

### 5. Set environment variables
Go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | (from database) |
| `DB_PORT` | `5432` (or `3306` for MySQL) |
| `DB_USER` | (from database) |
| `DB_PASSWORD` | (from database) |
| `DB_NAME` | (from database) |
| `JWT_SECRET` | (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

### 6. Deploy
Click **Create Web Service**. Render will auto-deploy on every push.

---

## Frontend (Vercel)

### 1. Create a Vercel account
Go to [vercel.com](https://vercel.com) and sign up.

### 2. Import your GitHub repo
1. Click **Add New** → **Project**
2. Import your GitHub repository
3. Select the `frontend` folder as the root directory

### 3. Configure the project
- **Framework Preset:** Next.js
- **Root Directory:** `frontend` (if your repo has both frontend and backend)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### 4. Set environment variables
Go to **Settings** → **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-app.onrender.com/api` |
| `NEXT_PUBLIC_WS_URL` | `https://your-app.onrender.com` |

### 5. Deploy
Click **Deploy**. Vercel will auto-deploy on every push.

---

## Post-Deployment Checklist

1. **Update CORS:** After deploying, update `ALLOWED_ORIGINS` on Render to include your Vercel URL
2. **Run migrations:** Migrations run automatically on first deploy via `render-start` script
3. **Test health check:** Visit `https://your-app.onrender.com/health` to verify
4. **Test the app:** Visit your Vercel URL and test all features

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `DB_HOST` | Yes | Database host from Render |
| `DB_PORT` | Yes | Database port (5432 for PostgreSQL, 3306 for MySQL) |
| `DB_USER` | Yes | Database user from Render |
| `DB_PASSWORD` | Yes | Database password from Render |
| `DB_NAME` | Yes | Database name from Render |
| `JWT_SECRET` | Yes | Random 64-character string |
| `ALLOWED_ORIGINS` | Yes | Your Vercel frontend URL |
| `PORT` | No | Defaults to 5000 (Render sets this automatically) |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Your Render backend URL + `/api` |
| `NEXT_PUBLIC_WS_URL` | Yes | Your Render backend URL (without `/api`) |

---

## Useful Commands

```bash
# Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test locally with production env
NODE_ENV=production npm run dev

# Check backend health
curl https://your-app.onrender.com/health
```
