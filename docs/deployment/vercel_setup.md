# Vercel Deployment Guide (No Custom Domain Required)

Guide for deploying the **Unified Organization Workspace** Next.js 15 frontend shell to **Vercel** with automatic HTTPS and free `*.vercel.app` subdomains.

---

## 🏗️ Architecture Split (Vercel Frontend + Hosted Backend)

```text
       ┌───────────────────────────────┐
       │     Vercel Edge Network       │
       │  (your-app.vercel.app)        │
       │   Next.js 15 App Router       │
       └──────────────┬────────────────┘
                      │  REST API Calls (https://...)
                      ▼
       ┌───────────────────────────────┐
       │     Backend Express API       │
       │ (Render / Railway / Docker)   │
       └───────────────────────────────┘
```

---

## 🚀 Step 1: Deploy Frontend to Vercel

### Method A: Vercel Dashboard (Recommended)

1. Push your repository to **GitHub**.
2. Log in to [Vercel](https://vercel.com) and click **"Add New" → "Project"**.
3. Select your GitHub repository (`unified-workspace` or `froncort`).
4. In **Project Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Select `client`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   Add `NEXT_PUBLIC_API_URL` pointing to your deployed backend Express API:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com/api/v1
   ```
6. Click **Deploy**. Vercel will assign a live URL like `https://unified-workspace.vercel.app`.

---

### Method B: Vercel CLI

Run from the terminal:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy client workspace
cd client
vercel
```

Follow the prompts to link the project. For production release:

```bash
vercel --prod
```

---

## ⚙️ Step 2: Free Backend API Hosting Options (No Domain Needed)

Since Vercel is optimized for serverless frontend applications, your Express API server, PostgreSQL database, and Redis cache require a Node host with automated free HTTPS endpoints:

| Cloud Host      | Free Tier / URL Provided            | Database / Cache Support          | Deployment Command              |
| :-------------- | :---------------------------------- | :-------------------------------- | :------------------------------ |
| **Render.com**  | Free `https://<app>.onrender.com`   | Managed Postgres + Redis included | Dockerfile deployment from repo |
| **Railway.app** | Free `https://<app>.up.railway.app` | Managed Postgres + Redis          | One-click Dockerfile deploy     |
| **Fly.io**      | Free `https://<app>.fly.dev`        | Postgres + Redis extension        | `fly launch`                    |

### Deploying Backend to Render.com via Docker:

1. Create a **Web Service** on Render pointing to your GitHub repo.
2. Select **Dockerfile** as runtime and specify `docker/Dockerfile.server`.
3. Set environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `REDIS_URL`: Your Redis connection string
   - `CLIENT_URL`: `https://your-app.vercel.app` (Your Vercel URL for CORS)
   - `JWT_SECRET`: Minimum 32-character random secret key
4. Render will generate a free SSL backend endpoint: `https://your-api.onrender.com`.

---

## 🔒 Step 3: Configure CORS & Client URL

Ensure your backend Express server accepts requests from your Vercel URL. In your backend `.env`:

```env
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

And in your Vercel project environment settings:

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1
```
