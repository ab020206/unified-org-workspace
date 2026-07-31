# Setup & Installation Guide — Unified Organization Workspace

This document provides step-by-step instructions to set up, configure, migrate, seed, run, and test the **Unified Organization Workspace** application in local and staging environments.

---

## 📋 Prerequisites

Ensure your environment satisfies the following baseline requirements:

| Tool | Version Requirement | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` (v20 Recommended) | JavaScript Runtime |
| **npm** | `>= 9.0.0` | Package Manager |
| **PostgreSQL** | `>= 15.0` (or Neon Serverless URL) | Primary Relational Database |
| **Redis** | `>= 6.0` (or Upstash Redis URL) | Cache & Session Store (Optional fallback) |
| **Git** | `>= 2.30.0` | Source Code Control |

---

## 🛠️ Step 1: Environment Variables Configuration

Copy `.env.example` to `.env` in the root project directory:

```bash
cp .env.example .env
```

### Key Environment Variables

Modify `.env` to match your local setup:

```ini
# Primary Database Connection String (PostgreSQL / Neon)
DATABASE_URL="postgresql://workspace_user:workspace_pass@localhost:5432/workspace_db?schema=public"

# Redis Server URL (Local or Upstash Cloud)
REDIS_URL="redis://localhost:6379"

# Server Port & Mode
PORT=4000
NODE_ENV=development
CLIENT_URL="http://localhost:3000"

# Cryptographic Auth Secrets (32+ characters recommended)
JWT_SECRET="unified-workspace-256-bit-access-secret-key-32chars"
JWT_REFRESH_SECRET="unified-workspace-256-bit-refresh-secret-key-32chars"

# Optional: Google Gemini AI Key (If omitted, system uses MockAIProvider fallback)
GEMINI_API_KEY=""

# Optional: Disable Rate Limiting for Demo/Testing
SKIP_RATE_LIMIT=true
```

---

## 📦 Step 2: Dependencies Installation

Install all project dependencies:

```bash
npm install
```

---

## 🗄️ Step 3: Database Setup & Migration

Generate Prisma Client and apply migrations:

```bash
# 1. Generate Prisma Client TypeScript definitions
npm run db:generate

# 2. Run Database Migrations (Applies SQL migrations from prisma/migrations)
npm run db:migrate
```

---

##  🌱 Step 4: Seed Database with Demo Data

Populate the database with demo users, multi-membership accounts, organizations, tickets, pull requests, audit logs, and notifications:

```bash
npm run seed
```

> [!TIP]
> Executing `npm run seed` hydrates 12 demo user accounts (including `superadmin@platform.demo`, `john@demo.com`, `admin@acme.demo`, etc.) with default password `Demo@12345`.

---

## 🚀 Step 5: Running the Application

### Option A: Standard Development Mode (Next.js Application)

Start the Next.js development server (runs frontend & App Router API endpoints on `http://localhost:3000`):

```bash
npm run dev
```

### Option B: Async Worker Engine Execution

To execute the background AI Digest worker queue processor (`digest.worker.ts`):

```bash
npm run worker
```

---

## 🧪 Step 6: Running the Master Test Suite

Execute the comprehensive 65-assertion master test suite (covering Auth, RBAC, Tenant Isolation, Cross-Org Sharing, Security, and Performance):

```bash
npm run test
```

---

## 🔍 Step 7: Useful Utility Commands

| Command | Action Description |
| :--- | :--- |
| `npm run typecheck` | Validates TypeScript types across the entire project (`tsc --noEmit`) |
| `npm run lint` | Runs Next.js ESLint rules |
| `npm run format` | Prettifies code files (`prettier --write`) |
| `npm run db:reset` | Wipes the database schema and re-runs all migrations + seeds |

---

## 🚨 Troubleshooting Common Issues

### 1. Database Connection Refused (`P1001`)
- **Cause**: PostgreSQL is not running or credentials in `DATABASE_URL` are incorrect.
- **Fix**: Check `pg_isready` or verify connection parameters in `.env`.

### 2. Redis Connection Warning
- **Log**: `⚠️ Redis Client Error: connect ECONNREFUSED 127.0.0.1:6379`
- **Fix**: Redis is optional for basic local dev. The system automatically degrades gracefully when Redis is offline. To use Redis, start `redis-server` or update `REDIS_URL`.

### 3. Gemini API Key Missing Warning
- **Log**: `GEMINI_API_KEY not configured. Falling back to MockAIProvider`
- **Fix**: Add a valid Google Gemini API key to `.env` or ignore; the built-in `MockAIProvider` generates simulated AI briefings cleanly without external network calls.
