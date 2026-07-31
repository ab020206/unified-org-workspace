# Unified Organization Workspace — Enterprise Architecture & Handover Package

Welcome to the enterprise reviewer documentation package for the **Unified Organization Workspace** platform. This directory contains a complete, production-grade architectural analysis, system design documentation, database specifications, security models, test results, and 20 detailed architecture diagrams.

> [!NOTE]
> All documentation in this `submission/` directory reflects the **exact codebase implementation** verified through line-by-line static code analysis, database schema inspection, and execution of the 65-assertion master test suite.

---

## 📁 Submission Directory Structure

```
submission/
├── README.md                           # Master Handover & Navigation Guide (This file)
├── SETUP.md                            # Complete Installation & Environment Setup Guide
├── ASSIGNMENT_COMPLIANCE.md            # Traceability Matrix for Assignment Requirements
├── SYSTEM_ARCHITECTURE.md              # End-to-End Technical System Architecture
├── IDENTITY_ORGANIZATION_SERVICE.md    # Auth, Tenant Resolution & Cross-Org Engine
├── DASHBOARD_ARCHITECTURE.md           # 6-Persona Dashboard Architecture & Widget Specs
├── DATABASE.md                         # Database ERD, Schema, Indexing & Relations
├── RBAC.md                             # Role & Permission Inheritance Engine
├── API_OVERVIEW.md                     # API Directory, Middleware Pipeline & Contracts
├── SECURITY.md                         # Threat Model, Token Lifecycle & Auditability
├── TESTING.md                          # Test Architecture & 65-Assertion Test Suite
├── DEMO_GUIDE.md                       # Persona-based Demo Guide & Pre-seeded Logins
├── KNOWN_LIMITATIONS.md                # Empirical Limitations & Verified Edge Cases
├── FUTURE_IMPROVEMENTS.md              # Enterprise Roadmap & Recommended Enhancements
├── IMPLEMENTATION_DECISIONS.md         # Design Rationale & Technology Trade-offs
├── SUBMISSION_CHECKLIST.md             # Reviewer Verification & Handover Checklist
│
├── diagrams/
│   ├── README.md                       # Master Architecture Diagrams Index
│   ├── context/                        # C4 System Context & Tenant Isolation Diagrams
│   ├── containers/                     # C4 Container Topology Diagrams
│   ├── components/                     # Backend, Frontend & Subsystem Component Diagrams
│   ├── sequence/                       # Auth, Switching, PR & Ticket Sequence Diagrams
│   ├── database/                       # Entity-Relationship Diagrams & Schema Schematics
│   ├── deployment/                     # Physical & Containerized Deployment Diagrams
│   └── exports/                        # C4, PlantUML, D2 & Mermaid Export Guide
│
└── assets/                             # Architecture Diagrams Index & Screenshots
```

---

## 🚀 Quick Navigation

| Document | Description | Key Focus Areas |
| :--- | :--- | :--- |
| [SETUP.md](./SETUP.md) | Full Setup & Installation | Prerequisites, `.env`, Prisma Migrate, Seed, Dev/Worker execution |
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | High-Level Architecture | Next.js 15, Express backend, Prisma ORM, Redis queues, Gemini AI |
| [IDENTITY_ORGANIZATION_SERVICE.md](./IDENTITY_ORGANIZATION_SERVICE.md) | Auth & Tenant Engine | JWT Access + DB Session, `x-organization-id` header, Cross-Org Shares |
| [DASHBOARD_ARCHITECTURE.md](./DASHBOARD_ARCHITECTURE.md) | 6 Persona Dashboards | SuperAdmin, OrgAdmin, Support, Reviewer, Guest, Auditor views |
| [RBAC.md](./RBAC.md) | RBAC & Overrides | 6 Roles, 25 Permissions, `PermissionOverride` model, SuperAdmin bypass |
| [DATABASE.md](./DATABASE.md) | Database Specification | 21 Prisma models, Foreign Key cascades, Indexes, Enum definitions |
| [API_OVERVIEW.md](./API_OVERVIEW.md) | API Routes & Middleware | Middleware stack (`auth`, `tenantContext`, `resolvePermissions`, rate limiting) |
| [SECURITY.md](./SECURITY.md) | Security Posture | Security headers, SHA-256 token hashing, Bcrypt (10 rounds), Audit pipeline |
| [TESTING.md](./TESTING.md) | Test Architecture | 65-assertion master test runner, SuperTest, Security & Perf benchmarks |
| [DEMO_GUIDE.md](./DEMO_GUIDE.md) | Persona Demo Guide | 12 Pre-seeded demo user accounts, password (`Demo@12345`), step-by-step flows |
| [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) | Codebase Limitations | Empirically verified edge cases and design boundaries |
| [FUTURE_IMPROVEMENTS.md](./FUTURE_IMPROVEMENTS.md) | Enterprise Roadmap | SAML/SSO, WebSocket notifications, Fine-grained ABAC, Distributed locks |
| [IMPLEMENTATION_DECISIONS.md](./IMPLEMENTATION_DECISIONS.md) | Design Rationale | Hybrid Next.js / Express design, DB Session validation, Gemini AI fallback |
| [ASSIGNMENT_COMPLIANCE.md](./ASSIGNMENT_COMPLIANCE.md) | Requirement Matrix | 100% compliance mapping across all prompt requirements |
| [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) | Reviewer Verification | Final handoff sign-off checklist |
| [Architecture Diagrams Index](./diagrams/README.md) | Diagrams Master Index | Complete index of all 20 diagrams |

---

## 🎨 20 Architecture Diagrams Overview

All 20 required architecture diagrams have been generated under `./diagrams/`. Each diagram is provided both as a readable Markdown document (with embedded visual diagrams) and as an editable raw source file (`.c4`, `.puml`, `.d2`).

### Diagram Directory Index

1. **[01 System Context Diagram](./diagrams/context/01_system_context.md)** — High-level system context using C4 Structurizr model.
2. **[02 Container Diagram](./diagrams/containers/02_container_diagram.md)** — High-level container topology showing Web UI, API, DB, Queue & External services.
3. **[03 Backend Component Diagram](./diagrams/components/03_backend_component.md)** — PlantUML/Mermaid component breakdown of Controllers, Services, Repositories, Middlewares.
4. **[04 Frontend Component Diagram](./diagrams/components/04_frontend_component.md)** — React/Next.js component hierarchy, AuthContext, OrgSwitcher, Dashboard layouts.
5. **[05 Identity & Organization Service](./diagrams/components/05_identity_org_service.md)** — Auth, Session management, Member repository & Org resolution details.
6. **[06 Authentication Sequence](./diagrams/sequence/06_authentication_sequence.md)** — Register/Login flow, JWT issuance, Refresh Token rotation & Session DB validation.
7. **[07 Organization Switching Sequence](./diagrams/sequence/07_organization_switching_sequence.md)** — Header injection, org verification, context re-hydration.
8. **[08 RBAC Decision Flow](./diagrams/components/08_rbac_decision_flow.md)** — Super Admin bypass -> Role Defaults -> `PermissionOverride` evaluation logic.
9. **[09 Tenant Isolation Diagram](./diagrams/context/09_tenant_isolation_diagram.md)** — Data boundary isolation, multi-tenancy rules, cross-tenant resource sharing trust boundaries.
10. **[10 Dashboard Architecture](./diagrams/components/10_dashboard_architecture.md)** — Role-based router delegating to 1 of 6 dashboard views.
11. **[11 Support Ticket Lifecycle](./diagrams/sequence/11_support_ticket_lifecycle.md)** — Open -> In Progress -> Waiting -> Resolved -> Closed / Reopened state machine.
12. **[12 Review Workflow](./diagrams/sequence/12_review_workflow.md)** — Draft -> Under Review -> Changes Requested / Approved -> Merged workflow.
13. **[13 Audit Logging Pipeline](./diagrams/components/13_audit_logging_pipeline.md)** — Action trigger -> Middleware metadata -> Audit Service -> AuditLog DB write.
14. **[14 Notification Pipeline](./diagrams/components/14_notification_pipeline.md)** — Event dispatch -> Preferences check -> In-app notification creation & delivery.
15. **[15 Database ER Diagram](./diagrams/database/15_database_er_diagram.md)** — Complete 21-model entity relationship diagram.
16. **[16 Deployment Diagram](./diagrams/deployment/16_deployment_diagram.md)** — Vercel / Render / Docker Compose physical deployment topology.
17. **[17 Request Lifecycle](./diagrams/sequence/17_request_lifecycle.md)** — Full HTTP request execution path through 8 middleware stages.
18. **[18 API Interaction Diagram](./diagrams/components/18_api_interaction_diagram.md)** — API Route-to-Controller-to-Service dependency mapping.
19. **[19 Background Job Flow](./diagrams/sequence/19_background_job_flow.md)** — Enqueue Digest Job -> Digest Queue -> Worker -> Gemini AI -> Digest & Notif DB persist.
20. **[20 Complete Data Flow Diagram](./diagrams/components/20_complete_data_flow_diagram.md)** — Comprehensive end-to-end data trajectory.

---

## 🛠️ Technology Stack Summary

- **Frontend**: Next.js 15 (App Router), React 19 RC, Tailwind CSS, Framer Motion, React Query, Lucide Icons.
- **Backend Services**: Node.js 20, TypeScript 5.4, Express sub-app, Pino Logger, BcryptJS, JSONWebTokens.
- **Database & ORM**: PostgreSQL (Neon Serverless compatible), Prisma ORM 5.14 with 21 relational models.
- **Caching & Queues**: Redis (ioredis), custom async worker queue (`DigestQueue`) with `digest.worker.ts`.
- **AI Integration**: Google Gemini (`@google/generative-ai`) with automatic `MockAIProvider` fallback.
- **Testing Framework**: SuperTest, custom Node assert test runner (`tests/testRunner.ts`) executing 65 tests.
