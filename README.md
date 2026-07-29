# Unified Organization Workspace — Enterprise Multi-Tenant Platform

Production-ready enterprise platform featuring secure multi-tenant isolation, RBAC permission engine, ticket management, pull request review console, cross-organization sharing, AI executive digest engine, real-time notifications, feature flags, rate limiting, and automated security validation.

---

## System Architecture Pipeline

```text
Request → Authentication → Tenant Resolution → Permission Check → Feature Flag Check → Validation → Business Logic → Audit Logging → Response
```

```text
workspace/
├── client/                 # Next.js 15 App Router Frontend Shell & Security Console
│   ├── app/                # Next.js pages (tickets, PRs, audit, collaboration, digest, notifications, security)
│   ├── components/         # Reusable UI & Security components (SessionCard, FeatureFlagToggle, Badges)
│   ├── context/            # AuthContext & Organization context
│   └── lib/                # API client layer (ticketApi, pullRequestApi, securityApi, etc.)
│
├── server/                 # Express.js Multi-Tenant API Engine
│   ├── prisma/             # Schema, migrations, & seed generators
│   ├── tests/              # Comprehensive test suite (unit, integration, security, performance, e2e)
│   └── src/
│       ├── ai/             # Gemini AI Digest prompt manager & generator
│       ├── config/         # Environment configuration (Zod), Prisma & Redis singletons
│       ├── controllers/    # Express controllers
│       ├── middleware/     # Auth, TenantContext, Authorize, FeatureFlag, RateLimiter, Sanitize, Upload
│       ├── queues/         # BullMQ queue managers & job processors
│       ├── repositories/  # Tenant-isolated database repository layer
│       ├── routes/        # Versioned API routes (/api/v1)
│       ├── services/      # Business logic services (Auth, Org, Ticket, PR, Audit, Sharing, Digest, Security)
│       └── testRunner.ts  # Master 73-point test execution runner
│
├── packages/               # Shared Monorepo Workspaces
│   ├── shared-config/      # TypeScript & ESLint presets
│   ├── shared-types/       # Monorepo TypeScript interfaces & enums
│   └── shared-utils/       # Standardized response formatters
│
├── .github/workflows/      # Automated CI/CD GitHub Actions Workflow (ci.yml)
├── docker/                 # Production Dockerfiles (Dockerfile.server, Dockerfile.client)
└── docker-compose.yml      # Multi-container orchestration (PostgreSQL, Redis, Server, Client)
```

---

## Key Modules & Platform Features

| Module                        | Features & Technical Highlights                                                                                                          |
| :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth & Security**           | JWT access tokens, refresh token rotation, device tracking, session revocation, logout everywhere.                                       |
| **Multi-Tenant Architecture** | Automatic tenant resolution via `X-Organization-Id` header, strict query scoping, zero BOLA/IDOR leakage.                                |
| **RBAC Permission System**    | Hierarchical roles (`SUPER_ADMIN`, `ADMIN`, `SUPPORT_AGENT`, `REVIEWER`, `GUEST`) with granular permission overrides.                    |
| **Support Hub (Tickets)**     | Complete ticket lifecycle (Open, In Progress, Resolved, Closed), activity timeline, attachments, comments.                               |
| **Review Console (PRs)**      | Versioned code changes, reviewer assignment, approval rules, inline review comments, merge workflow.                                     |
| **Cross-Org Collaboration**   | Connection handshakes (Pending -> Accepted), granular resource sharing (`READ`, `REVIEW`, `APPROVE`, `FULL_ACCESS`).                     |
| **✨ AI Digest Engine**       | Background queue processing (BullMQ + Redis), Gemini AI summary generation, fallback retry policies.                                     |
| **Notifications**             | Real-time notification engine with unread badges, mark-as-read, and preference controls.                                                 |
| **Feature Flags**             | Centralized flag control (`AI_DIGEST`, `CROSS_ORG_SHARING`, `REVIEW_CONSOLE`, `NOTIFICATIONS`, `ADVANCED_ANALYTICS`) with org overrides. |
| **Security Console**          | Interactive admin board for system health monitoring, active session revocation, and live feature flag toggling.                         |

---

## Quickstart Guide

### Option A: Docker Compose (Recommended)

Run the entire platform with PostgreSQL, Redis, Backend, and Frontend:

```bash
docker compose up --build
```

Access the services:

- **Frontend Workspace**: [http://localhost:3000](http://localhost:3000)
- **Backend API Health**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

### Option B: Local Development

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Setup Environment**:

   ```bash
   cp .env.example .env
   ```

3. **Start PostgreSQL & Redis**:

   ```bash
   docker compose up postgres redis -d
   ```

4. **Generate Prisma Client & Seed Database**:

   ```bash
   npm run db:generate
   npm run db:seed
   ```

5. **Start Dev Server (Client + Server Concurrently)**:
   ```bash
   npm run dev
   ```

---

## Automated Test Execution

Run the master test suite (Unit, Integration, Security, Performance & E2E journeys):

```bash
npm run test --workspace=server
```

Run frontend & backend type checks and linting:

```bash
npm run format:check
npm run lint
npm run build
```

---

## CI/CD Pipeline Summary

Automated GitHub Actions CI pipeline ([.github/workflows/ci.yml](file:///.github/workflows/ci.yml)):

1. **Code Quality**: ESLint, Prettier, and TypeScript compilation.
2. **Database Migration**: Automatic schema generation and seed verification against live PostgreSQL.
3. **Master Test Suite Execution**: Executes all 73 integration, security, unit, performance, and E2E tests.
4. **Production Build**: Compiles production bundles for Next.js frontend and Express backend.

---

## Submission Package & Documentation Index

- 📐 **Database ER Diagram**: [er_diagram.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/diagrams/er_diagram.md)
- 🔄 **Sequence Diagrams**: [sequence_diagrams.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/diagrams/sequence_diagrams.md)
- 📖 **REST API Reference**: [api_documentation.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/api/api_documentation.md)
- 📮 **Postman Collection**: [Unified_Workspace.postman_collection.json](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/postman/Unified_Workspace.postman_collection.json)
- 📋 **Requirement Validation Matrix**: [validation_matrix.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/submission/validation_matrix.md)
- ✅ **Submission Checklist**: [submission_checklist.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/submission/submission_checklist.md)
- 🎥 **Demo Walkthrough Script**: [demo_script.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/demo/demo_script.md)
- 🚀 **Deployment Operations Guide**: [architecture.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/deployment/architecture.md) & [disaster_recovery.md](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/docs/deployment/disaster_recovery.md)
