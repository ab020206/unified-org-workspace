# System Architecture Specification — Unified Organization Workspace

This document defines the high-level system architecture, frontend and backend design patterns, identity services, database topology, background worker processing, AI integrations, and deployment configurations of the **Unified Organization Workspace** platform.

---

## 🏛️ 1. High-Level Architecture Overview

The system is architected as an **Enterprise Multi-Tenant SaaS Platform** built on a Next.js 15 App Router foundation with an integrated Express.js sub-app backend service pattern. It utilizes Prisma ORM over PostgreSQL (Neon compatible) for persistent relational data, Redis (ioredis) for caching/rate-limiting/queuing, and Google Gemini API (with Mock fallback) for automated AI digest generation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│   Next.js 15 (App Router) + React 19 RC + Tailwind CSS + Framer Motion  │
│   - AuthProvider (React Context) & React Query Cache                   │
│   - 6 Persona Dashboards (SuperAdmin, OrgAdmin, Support, etc.)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                           API & MIDDLEWARE LAYER                       │
│   Express / App Router Middlewares                                     │
│   1. Request ID & Logging (Pino)                                       │
│   2. Rate Limiting (express-rate-limit)                                │
│   3. Input Sanitization & Zod Validation                               │
│   4. Authentication (JWT + DB Session Validation)                      │
│   5. Tenant Context Injection (x-organization-id)                      │
│   6. RBAC & DB Permission Override Engine                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                            SERVICE LAYER                               │
│   AuthService | OrganizationService | TicketService | PullRequestService│
│   AuditService | NotificationService | AIInsightsService                │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
┌──────────────▼──────┐   ┌─────────▼──────────┐   ┌─────▼───────────────┐
│ PERSISTENCE LAYER   │   │  ASYNC WORKERS     │   │ EXTERNAL SERVICES   │
│ PostgreSQL / Neon   │   │  DigestQueue       │   │ Google Gemini AI    │
│ Prisma ORM (21)     │   │  digest.worker.ts  │   │ Upstash / Redis     │
└─────────────────────┘   └────────────────────┘   └─────────────────────┘
```

---

## 🎨 2. Frontend Architecture

### Core Technologies
- **Framework**: Next.js 15 (App Router, Client & Server Components).
- **UI Library**: React 19 (RC release `19.0.0-rc-6925828f`).
- **Styling**: Vanilla Tailwind CSS v3 with CSS custom variables for dark/light themes.
- **State & Data Fetching**: `@tanstack/react-query` v5 for client-side API caching, custom `AuthContext` for user session & organization state management.
- **Animation**: `framer-motion` v12 for smooth layout transitions and micro-interactions.

### Key Layout & Components Structure
- `app/(dashboard)/layout.tsx`: Main dashboard wrapper containing `Sidebar`, `Navbar`, `OrgSwitcher`, and notification bells.
- `components/OrgSwitcher.tsx`: Interactive organization switcher dropdown supporting search, recently used workspaces, and one-click tenant switching.
- `components/dashboards/`: 6 role-specific dashboard views (`SuperAdminDashboard`, `OrgAdminDashboard`, `SupportAgentDashboard`, `ReviewerDashboard`, `GuestDashboard`, `AuditorDashboard`).

---

## ⚙️ 3. Backend Architecture

### Design Patterns
- **Layered Architecture**: Controller Layer -> Service Layer -> Repository Layer -> Database.
- **Middleware Chain Pattern**: Express middleware composition pattern handling security, rate limiting, authentication, tenant isolation, and permission checking sequentially.
- **Repository Pattern**: Abstracted database operations into dedicated repository classes (`UserRepository`, `OrganizationRepository`, `MemberRepository`, `TicketRepository`, `PullRequestRepository`, `AuditRepository`).

### Primary Backend Subsystems
1. **Identity & Auth Subsystem**: JWT access tokens (15 min lifespan), SHA-256 hashed refresh tokens (7 day lifespan), active DB session validation.
2. **Organization & Multi-Tenancy Engine**: Organization CRUD, invitation tokens, multi-org user membership lookup, and `x-organization-id` header context forwarding.
3. **RBAC & Permission Override Service**: Role permission lookup with DB `PermissionOverride` grant/revoke resolution.
4. **Ticket & PR Subsystem**: Support ticket management, pull request code reviews, decision records, and GitHub sync state metadata.
5. **AI Digest Engine**: Non-blocking async queueing (`DigestQueue`) calling Google Gemini API or falling back to `MockAIProvider`.
6. **Audit & Notification Pipeline**: Immutable audit log creation and multi-channel notification dispatch.

---

## 🗄️ 4. Persistence Layer Architecture

- **Engine**: PostgreSQL hosted on Neon Serverless / local Docker.
- **ORM**: Prisma ORM v5.14 with 21 relational models:
  - `User`, `Organization`, `OrganizationMember`, `PermissionOverride`
  - `Session`, `RefreshToken`, `Invitation`
  - `Ticket`, `TicketComment`, `TicketAttachment`, `TicketActivity`
  - `PullRequest`, `PullRequestReviewer`, `ReviewDecision`, `PullRequestVersion`, `ReviewComment`, `PullRequestActivity`
  - `AuditLog`, `AuditMetadata`
  - `OrganizationConnection`, `SharedResource`, `SharedAccess`
  - `Digest`, `Notification`, `NotificationPreference`, `PushSubscription`, `AnomalyAlert`, `FeatureFlag`, `GitHubIntegration`

---

## ⚡ 5. Background Jobs & Worker Architecture

- **Queue Implementation**: `DigestQueue` in `src/queues/digest.queue.ts` (in-memory event queue backed by setImmediate processing loop).
- **Worker Execution**: `src/workers/digest.worker.ts` handles:
  1. Fetching user & org context.
  2. Aggregating active tickets, pending PR reviews, and shared resources.
  3. Formulating Gemini prompt via `PromptManager`.
  4. Invoking `aiService.generateCompletion()`.
  5. Writing result to `Digest` model and generating a `Notification`.
  6. Recording execution status in `JobHistory`.

---

## ☁️ 6. Deployment Configuration

- **Next.js Frontend & API Routes**: Deployed to **Vercel** or **Render** via `render.yaml` / Docker container.
- **Database**: PostgreSQL hosted on **Neon** serverless with connection pooling.
- **Cache / Redis**: Managed **Upstash Redis** or Redis instance.
- **Worker Process**: Executed as a separate background process (`npm run worker`) in Docker / Render background service.
