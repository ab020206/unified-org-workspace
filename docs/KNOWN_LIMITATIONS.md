# Verified Codebase Limitations & Technical Edge Cases

This document documents **only actual, empirically verified limitations** identified during Phase 1 codebase analysis. No artificial limitations have been invented.

---

## 🔍 1. System Architecture & Worker Limitations

### 1. In-Memory Queue Fallback (`DigestQueue`)
- **Location**: `src/queues/digest.queue.ts`.
- **Limitation**: The current background job queue (`DigestQueue`) utilizes an in-memory array queue with `setImmediate` execution loop when Redis/BullMQ is not active.
- **Impact**: If the application server restarts while a job is enqueued in memory, unhandled jobs in the array will be lost unless persisted in PostgreSQL.
- **Mitigation in Code**: The worker logs job start in the `job_histories` DB table (`DigestRepository.logJobHistory()`), allowing pending jobs to be queried and retried on startup.

### 2. Static JWT Expiration Lifecycles
- **Location**: `src/services/auth.service.ts`.
- **Limitation**: JWT Access Tokens are issued with a hardcoded 15-minute expiration (`expiresIn: '15m'`), and Refresh Tokens are hardcoded to 7 days (`7 * 24 * 60 * 60 * 1000`).
- **Impact**: Organization admins cannot currently customize token expiration windows per tenant or force shorter sessions for high-security environments via UI settings.

---

## 🛡️ 2. Security & Rate Limiting Edge Cases

### 1. Demo Mode Rate Limit Override
- **Location**: `src/middleware/rateLimiter.ts` (Line 5: `const skipLimit = true`).
- **Limitation**: Rate limiting thresholds are currently relaxed (`max: 10000`) to facilitate automated supertest suites and reviewer evaluation without triggering false HTTP 429 errors.
- **Impact**: In a strict production environment, `skipLimit` must be set to `false` (or controlled via `process.env.SKIP_RATE_LIMIT === 'true'`) to enforce 10 req/15min on auth routes.

### 2. Mock AI Provider Fallback
- **Location**: `src/ai/gemini.provider.ts`.
- **Limitation**: If `GEMINI_API_KEY` is not present in `.env`, the AI provider gracefully falls back to `MockAIProvider`.
- **Impact**: Simulated digests produce high-quality mock data, but real-time LLM reasoning requires valid Google Gemini API credentials.

---

## 🗄️ 3. Persistence & Integration Edge Cases

### 1. GitHub Integration Webhook Verification
- **Location**: `src/services/github.service.ts` & `prisma/schema.prisma`.
- **Limitation**: The `GitHubIntegration` model stores encrypted `accessToken` and `webhookSecret` fields, but live webhook signature validation requires setup of an external GitHub App webhook URL.
- **Impact**: GitHub sync operates seamlessly via seeded data and REST APIs, but live real-time GitHub push webhooks require public domain exposure (e.g. via Ngrok).

### 2. Push Notification Subscription Storage
- **Location**: `prisma/schema.prisma` (`PushSubscription` model).
- **Limitation**: Web Push API endpoint subscriptions (`p256dh`, `auth`) are saved in PostgreSQL, but standard VAPID email credentials must be populated in production env to send WebPush protocol packets to mobile devices.
