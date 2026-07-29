# Unified Organization Workspace — Enterprise Multi-Tenant Platform

[![CI/CD Pipeline](https://github.com/froncort/unified-workspace/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](package.json)
[![Next.js 15](https://img.shields.io/badge/frontend-Next.js%2015%20App%20Router-black.svg)](client/)
[![Express API](https://img.shields.io/badge/backend-Express.js%20%2B%20Prisma%20ORM-informational.svg)](server/)
[![Database](https://img.shields.io/badge/database-PostgreSQL%2016-blue.svg)](server/prisma/schema.prisma)
[![Cache & Queue](https://img.shields.io/badge/queue-Redis%20%2B%20BullMQ-red.svg)](server/src/queues/)

Production-ready enterprise platform developed for **Froncort.ai**, featuring multi-tenant isolation, granular RBAC permission engine, Support Ticket Lifecycle Hub, Pull Request Code Review Console, Cross-Organization Sharing, AI Executive Digest Engine (powered by Google Gemini API), Real-time Notifications, Dynamic Feature Flags, Rate Limiting, Anomaly Detection, and automated security validation.

---

## 📐 System Architecture & Monorepo Structure

```text
Request → Nginx Proxy → Authentication → Tenant Resolution → Permission Check → Feature Flag Check → Validation → Business Logic → Audit Logging → Response
```

```text
workspace/
├── client/                     # Next.js 15 App Router Frontend Shell & Security Console
│   ├── app/                    # App Router routes & workspace consoles
│   │   ├── (dashboard)/        # Authenticated enterprise layout & sub-consoles
│   │   │   ├── ai-workspace/   # Interactive AI assistant workspace & prompt playground
│   │   │   ├── analytics/      # Organizational performance metrics & activity heatmaps
│   │   │   ├── audit/          # Immutable compliance audit log viewer & exporter
│   │   │   ├── collaboration/  # Cross-org connection handshakes & shared resources
│   │   │   ├── dashboard/      # Main executive dashboard & system health overview
│   │   │   ├── digest/         # Gemini AI Executive Digest generator & history
│   │   │   ├── feature-flags/  # Live feature flag controls & organization overrides
│   │   │   ├── health/         # System service status & real-time latency monitor
│   │   │   ├── knowledge-graph/# Visual entity & organization relation viewer
│   │   │   ├── members/        # Member role management & invitation administration
│   │   │   ├── notifications/  # Notification center & push delivery preferences
│   │   │   ├── organizations/  # Multi-tenant organization switcher & settings
│   │   │   ├── pull-requests/  # Enterprise PR review console, diffs, & approvals
│   │   │   ├── reports/        # Custom report generation & compliance exports
│   │   │   ├── security/       # Security console, session revocation, & anomaly alerts
│   │   │   ├── settings/       # Organization & personal user profile settings
│   │   │   ├── tickets/        # Support ticket hub, SLA tracker, & timeline
│   │   │   └── users/          # Platform user directory & access control
│   │   ├── login/              # Secure JWT authentication portal
│   │   ├── register/           # Multi-tenant organization onboarding
│   │   ├── invitations/        # Member invitation acceptance workflow
│   │   ├── forgot-password/    # Password recovery & token reset
│   │   ├── maintenance/        # Dynamic maintenance mode fallback screen
│   │   └── 403/                # Unauthorized RBAC access boundary page
│   ├── components/             # Enterprise UI Design System, Modals, & Badges
│   ├── context/                # AuthContext & Multi-Tenant Organization Context
│   └── lib/                    # API client abstraction layer (tickets, PRs, security, etc.)
│
├── server/                     # Express.js Multi-Tenant Backend API Engine (Port 4000)
│   ├── prisma/                 # PostgreSQL schema, migrations, seed generators
│   ├── tests/                  # 73-Point Master Test Suite (Unit, Integration, Security, Perf, E2E)
│   └── src/
│       ├── ai/                 # Gemini AI Digest prompt builder & generation engine
│       ├── config/             # Zod environment validation, Prisma & Redis singletons
│       ├── controllers/        # Express request controllers
│       ├── middleware/         # Auth, TenantContext, Authorize, FeatureFlag, RateLimiter, Sanitize
│       ├── queues/             # BullMQ background job queues & workers (AI Digest, Notifications)
│       ├── repositories/      # Strict tenant-isolated database access layer
│       ├── routes/            # Versioned API route definitions (/api/v1)
│       ├── services/          # Core domain business logic services
│       └── testRunner.ts      # Automated master test execution framework
│
├── packages/                   # Shared Monorepo Workspaces
│   ├── shared-config/          # Enterprise TypeScript & ESLint presets
│   ├── shared-types/           # Shared TypeScript models, interfaces, and enums
│   └── shared-utils/           # Standardized API response formatters & string utilities
│
├── docker/                     # Production Dockerfiles & Nginx Reverse Proxy Config
│   ├── Dockerfile.server       # Backend Express API container build
│   ├── Dockerfile.client       # Frontend Next.js production build
│   ├── Dockerfile.worker       # BullMQ background queue worker build
│   └── nginx.conf              # Production Nginx reverse proxy configuration
│
├── docs/                       # Complete Architecture & Deployment Documentation
│   ├── api/                    # REST API Reference & OpenAPI specs
│   ├── demo/                   # Demo video script & presentation guide
│   ├── deployment/             # Infrastructure topology, Docker setup, & disaster recovery
│   ├── diagrams/               # Mermaid ER diagrams & sequence flows
│   ├── postman/                # Automated Postman API test collection
│   └── submission/             # Requirement verification matrix & submission checklist
│
├── scripts/                    # Operational Utilities (Database backup, restore, seeding)
├── docker-compose.yml          # Development multi-container orchestration
├── docker-compose.prod.yml     # Production multi-container deployment stack
└── creds.txt                   # Seeded demo user credentials for validation
```

---

## 🔑 Key Modules & Architecture Highlights

| Module                        | Technical Architecture & Capabilities                                                                                                                                             |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication & Security** | JWT access tokens, refresh token rotation, active session tracking, remote session revocation, password policy enforcement, and audit trail.                                      |
| **Multi-Tenant Architecture** | Automatic tenant resolution via `X-Organization-Id` header, strict Prisma query scoping, zero BOLA/IDOR cross-tenant data leaks.                                                  |
| **RBAC Permission Engine**    | Hierarchical roles (`SUPER_ADMIN`, `ADMIN`, `SUPPORT_AGENT`, `REVIEWER`, `AUDITOR`, `GUEST`) with fine-grained granular permission overrides per member.                          |
| **Support Hub (Tickets)**     | Complete support ticket lifecycle (`OPEN`, `IN_PROGRESS`, `WAITING_FOR_RESPONSE`, `RESOLVED`, `CLOSED`, `REOPENED`), SLA priority tracking, attachments, and timeline activities. |
| **Review Console (PRs)**      | Versioned code changes, reviewer assignment, required approval rules, inline code comments, GitHub webhook integration, and merge validation.                                     |
| **Cross-Org Collaboration**   | Connection handshake workflow (`PENDING` → `ACCEPTED`), granular resource sharing (`READ`, `COMMENT`, `REVIEW`, `APPROVE`, `FULL_ACCESS`), and access logs.                       |
| **✨ AI Digest Engine**       | Background queue processing via BullMQ + Redis, Google Gemini AI summary generation, token usage logging, and fallback handling.                                                  |
| **Notifications & Web Push**  | Real-time in-app notification center, unread indicators, Web Push (VAPID) delivery, and customizable event preferences.                                                           |
| **Feature Flags**             | Dynamic platform flag engine (`AI_DIGEST`, `CROSS_ORG_SHARING`, `REVIEW_CONSOLE`, `NOTIFICATIONS`, `ADVANCED_ANALYTICS`) with organization-level overrides.                       |
| **Security & Health Console** | Real-time node latency monitoring, live active session revocation, anomaly alert detection, and system maintenance toggles.                                                       |

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Permission / Action                        | SUPER_ADMIN | ADMIN | SUPPORT_AGENT | REVIEWER |  AUDITOR  |  GUEST   |
| :----------------------------------------- | :---------: | :---: | :-----------: | :------: | :-------: | :------: |
| **Organization Management**                |     ✅      |  ✅   |      ❌       |    ❌    |    ❌     |    ❌    |
| **Member Role / Permission Overrides**     |     ✅      |  ✅   |      ❌       |    ❌    |    ❌     |    ❌    |
| **Manage Feature Flags**                   |     ✅      |  ✅   |      ❌       |    ❌    |    ❌     |    ❌    |
| **Create / Manage Tickets**                |     ✅      |  ✅   |      ✅       |    ❌    | 👁️ (Read) |    ❌    |
| **Assign & Resolve Tickets**               |     ✅      |  ✅   |      ✅       |    ❌    |    ❌     |    ❌    |
| **Create / Review Pull Requests**          |     ✅      |  ✅   |      ❌       |    ✅    | 👁️ (Read) |    ❌    |
| **Approve & Merge PRs**                    |     ✅      |  ✅   |      ❌       |    ✅    |    ❌     |    ❌    |
| **Cross-Org Connection Handshake**         |     ✅      |  ✅   |      ❌       |    ❌    |    ❌     |    ❌    |
| **Share / Access Cross-Org Resources**     |     ✅      |  ✅   |      ✅       |    ✅    | 👁️ (Read) | Granular |
| **View Compliance Audit Logs**             |     ✅      |  ✅   |      ❌       |    ❌    |    ✅     |    ❌    |
| **Revoke Sessions & View Security Alerts** |     ✅      |  ✅   |      ❌       |    ❌    |    ✅     |    ❌    |

---

## ⚡ Quickstart Guide

### Option A: Local Docker Compose (Recommended)

Run PostgreSQL, Redis, Backend API, and Next.js Frontend with one command:

```bash
docker compose up --build
```

Access local endpoints:

- **Frontend App Workspace**: [http://localhost:3000](http://localhost:3000)
- **Backend API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

### Option B: Local Monorepo Development

1. **Install Monorepo Dependencies**:

   ```bash
   npm install
   ```

2. **Configure Environment Variables**:

   ```bash
   cp .env.example .env
   ```

3. **Start PostgreSQL & Redis Containers**:

   ```bash
   docker compose up postgres redis -d
   ```

4. **Generate Prisma Client & Seed Demo Data**:

   ```bash
   npm run db:generate
   npm run db:seed
   ```

5. **Launch Server & Client Concurrently**:
   ```bash
   npm run dev
   ```

---

## 🚀 Production & Cloud Deployment Options

### Option 1: Deploy Full Stack on Vercel as a Single Project (Recommended for Free Domain)

Deploy **both frontend UI and Express API backend** together as a single unified Next.js project on Vercel without needing a custom domain:

1. Import your repository into **Vercel** and set **Root Directory** to `client`.
2. Set Environment Variables:
   - `DATABASE_URL`: Cloud PostgreSQL string (e.g. free tier on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com))
   - `REDIS_URL`: Cloud Redis string (e.g. free tier on [Upstash.com](https://upstash.com))
   - `NEXT_PUBLIC_API_URL`: `/api/v1` (relative path, same origin)
   - `JWT_SECRET`: 32+ character random secret string
3. Full guide: [docs/deployment/vercel_single_project.md](docs/deployment/vercel_single_project.md)

---

### Option 2: Production Docker Compose Stack

Run the full multi-container production stack containing **Nginx Reverse Proxy**, **Next.js Client**, **Express API Server**, **BullMQ Worker**, **PostgreSQL**, and **Redis**:

1. **Create `.env.production`**:

   ```env
   NODE_ENV=production
   POSTGRES_USER=prod_workspace_user
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=prod_workspace_db
   JWT_SECRET=your_minimum_32_character_jwt_secret
   NEXT_PUBLIC_API_URL=http://your-domain-or-ip/api/v1
   CLIENT_URL=http://your-domain-or-ip
   ```

2. **Spin Up Production Stack**:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Deploy Migrations & Verify Health**:
   ```bash
   docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
   docker compose -f docker-compose.prod.yml exec server npx prisma db seed
   docker compose -f docker-compose.prod.yml ps
   ```

---

### Option 3: Native Process Management (PM2)

For deployment to cloud hosts (AWS EC2, DigitalOcean, Hetzner) using managed databases:

1. **Build Production Bundles**:

   ```bash
   npm install
   npm run build
   ```

2. **Apply Database Migrations**:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Start Services with PM2**:
   ```bash
   npm install -g pm2
   pm2 start server/dist/index.js --name "workspace-server"
   pm2 start "npm run start --workspace=client" --name "workspace-client"
   pm2 start server/dist/queues/worker.js --name "workspace-worker"
   pm2 save
   ```

---

### Option 3: Deploy Frontend to Vercel (No Domain Needed)

Deploy the Next.js 15 frontend shell to **Vercel** with a free `*.vercel.app` HTTPS domain:

1. Connect your repository to **Vercel**.
2. Set **Root Directory** to `client`.
3. Add Environment Variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com/api/v1
   ```
4. Complete setup using [docs/deployment/vercel_setup.md](docs/deployment/vercel_setup.md).

---

## 🧪 Master Test Suite & Verification

The backend includes an automated 73-point master test runner ([server/src/testRunner.ts](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/server/src/testRunner.ts)) validating Unit, Integration, Security (RBAC/BOLA/IDOR), Performance, and E2E scenarios.

Run the test suite:

```bash
npm run test --workspace=server
```

Run linting, formatting, and production build checks:

```bash
npm run format:check
npm run lint
npm run build
```

---

## 🔄 CI/CD Automation

The GitHub Actions CI workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) automatically executes on push and pull requests:

1. **Code Quality**: Prettier check, ESLint verification, TypeScript compilation.
2. **Database Integration**: PostgreSQL container initialization, migration test execution, seed validation.
3. **Automated Testing**: Master test suite execution (73/73 tests).
4. **Production Build**: Verification of Next.js static asset generation and Express distribution compilation.

---

## 📚 Complete Submission Package & Documentation Index

- 📐 **Database ER Diagram**: [er_diagram.md](docs/diagrams/er_diagram.md)
- 🔄 **Sequence Diagrams**: [sequence_diagrams.md](docs/diagrams/sequence_diagrams.md)
- 📖 **REST API Reference**: [api_documentation.md](docs/api/api_documentation.md)
- 📮 **Postman Collection**: [Unified_Workspace.postman_collection.json](docs/postman/Unified_Workspace.postman_collection.json)
- 📋 **Requirement Validation Matrix**: [validation_matrix.md](docs/submission/validation_matrix.md)
- ✅ **Submission Checklist**: [submission_checklist.md](docs/submission/submission_checklist.md)
- 🎥 **Demo Walkthrough Script**: [demo_script.md](docs/demo/demo_script.md)
- 🚀 **Deployment Architecture**: [architecture.md](docs/deployment/architecture.md)
- 📐 **Vercel Setup Guide**: [vercel_setup.md](docs/deployment/vercel_setup.md)
- 🐳 **Docker Operations Guide**: [docker_setup.md](docs/deployment/docker_setup.md)
- 🛡️ **Disaster Recovery Plan**: [disaster_recovery.md](docs/deployment/disaster_recovery.md)
- 📋 **Production Launch Checklist**: [production_checklist.md](docs/deployment/production_checklist.md)
