# Deploying Both Frontend & Backend on Vercel (Single Next.js Project)

Yes! You can deploy **both the frontend and backend together** on Vercel as a single unified Next.js project under one free `*.vercel.app` URL.

---

## 🎯 How It Works

```text
                        ┌─────────────────────────────────────────┐
                        │          Vercel Single Project          │
                        │        (https://your-app.vercel.app)     │
                        ├────────────────────┬────────────────────┤
                        │    Frontend UI     │   Express Backend  │
                        │ Next.js App Router │ Serverless Handler │
                        └─────────┬──────────┴─────────┬──────────┘
                                  │                    │
                                  ▼                    ▼
                           User Browser        PostgreSQL & Redis
                                             (Neon.tech & Upstash)
```

1. **Same-Origin Requests**: Both UI and API endpoints share the domain `https://your-app.vercel.app`.
2. **Zero CORS Issues**: The frontend calls relative paths `/api/v1/...` directly.
3. **Free Serverless Infrastructure**:
   - **Frontend & API**: Hosted on Vercel (Free Tier).
   - **PostgreSQL**: Hosted on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com) (Free Tier).
   - **Redis**: Hosted on [Upstash.com](https://upstash.com) (Free Tier).

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Set Up Free Database & Redis

1. **PostgreSQL Database (Neon.tech)**:
   - Sign up at [neon.tech](https://neon.tech) and create a project.
   - Copy your connection string: `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`

2. **Redis Cache (Upstash.com)**:
   - Sign up at [upstash.com](https://upstash.com) and create a Redis database.
   - Copy your connection string: `rediss://default:pass@xyz.upstash.io:6379`

---

### Step 2: Configure Vercel Project

1. Push your repository to **GitHub**.
2. Go to **[Vercel Dashboard](https://vercel.com/new)** and import your repository.
3. Set **Root Directory** to `client`.
4. Configure **Environment Variables** in Vercel settings:

```env
DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:pass@xyz.upstash.io:6379
JWT_SECRET=your_32_character_secret_jwt_key_here
NODE_ENV=production
NEXT_PUBLIC_API_URL=/api/v1
```

5. Click **Deploy**. Vercel will automatically build and publish your unified app.

---

### Step 3: Run Database Migrations for Production DB

Run Prisma migrations against your cloud database from your local machine:

```bash
DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require" npm run db:migrate --workspace=server
DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require" npm run db:seed --workspace=server
```

---

## 💡 Key Highlights of Single Project Vercel Deployment

- **No Domain Required**: Instant HTTPS domain assigned (e.g. `https://froncort-workspace.vercel.app`).
- **Zero CORS Configuration**: Everything operates on the same origin.
- **Automatic CI/CD**: Every `git push` creates a preview deployment and automatically deploys production updates to Vercel.
