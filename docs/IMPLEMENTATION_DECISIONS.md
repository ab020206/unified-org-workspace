# Architectural Trade-offs & Implementation Decisions

This document outlines key technical decisions, design trade-offs, pattern choices, and technology selections made during the development of the **Unified Organization Workspace**.

---

## 🏛️ 1. Next.js 15 App Router + Express Hybrid Architecture

### Decision
Combine Next.js 15 App Router (Presentation layer, client state, SSR) with an Express sub-app pattern (`src/app.ts`, `src/services/`, `src/controllers/`) for API business logic.

### Rationale
- **Benefits**: Provides optimal developer experience for UI rendering with React 19 and Framer Motion, while retaining standard Express middleware composition (`authenticate`, `tenantContext`, `resolvePermissions`) for enterprise security pipelines.
- **Trade-off**: Requires maintaining route parity between `app/api/*` Next.js serverless handlers and Express sub-app route controllers.

---

## 🔐 2. Hybrid JWT & Database Session Model

### Decision
Issue 15-minute JWT Access Tokens containing user ID and session ID (`sid`), but validate session activity against the database `Session` table in `authenticate` middleware.

### Rationale
- **Benefits**: Achieves stateless performance benefits of JWT token parsing for micro-claims while preserving enterprise "Instant Revocation" (Logout/Logout All) capability.
- **Trade-off**: Requires a fast single-row DB lookup per authenticated request (mitigated by index on `Session.id` and Redis session caching).

---

## 🗄️ 3. Prisma ORM Over Raw SQL / Query Builders

### Decision
Utilize Prisma ORM v5.14 with 21 relational models and explicit TypeScript schema definitions.

### Rationale
- **Benefits**: Ensures 100% type-safe queries, automatic migration management (`prisma migrate`), auto-generated TypeScript types shared across frontend and backend (`@workspace/shared-types`), and reliable foreign key cascade handling.
- **Trade-off**: Slightly higher memory overhead than minimal query builders (e.g. Kysely), offset by strong developer productivity and safety against SQL injection.

---

## 🤖 4. Gemini AI Provider with Graceful Mock Fallback

### Decision
Implement `GeminiAIProvider` with lazy module loading (`@google/generative-ai`) and automated fallback to `MockAIProvider` when credentials or network connectivity are absent.

### Rationale
- **Benefits**: Ensures the platform and background worker remain 100% operational in isolated development, offline demo, or continuous integration (CI) environments without hard external dependencies.
- **Trade-off**: Mock fallback produces deterministic simulated digests rather than live LLM outputs when API keys are missing.
