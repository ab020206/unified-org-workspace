# Security Architecture, Threat Model & Compliance

This document outlines the security architecture, threat model, HTTP security headers, token cryptographic lifecycles, rate limiting policies, and audit logging pipeline of the **Unified Organization Workspace**.

---

## 🛡️ 1. Threat Model & Security Posture

The application is engineered to operate in untrusted zero-trust environments. The threat model mitigates standard OWASP Top 10 vulnerabilities through defense-in-depth controls:

```
┌───────────────────────────────┐
│     OWASP Vulnerability       │ ──►  Mitigation Control Implemented
├───────────────────────────────┤
│ A01: Broken Access Control     │ ──►  Strict Tenant Context Isolation (`tenantContext.ts`) + RBAC Middleware
│ A02: Cryptographic Failures   │ ──►  Bcrypt (10 salt rounds), SHA-256 Refresh Hashes, TLS Enforced
│ A03: Injection (SQL / XSS)    │ ──►  Prisma Parameterized Queries + DOM Input Sanitization Middleware
│ A04: Insecure Design          │ ──►  Dual JWT / DB Session Validation + Multi-Tenant Connection Boundaries
│ A05: Security Misconfig       │ ──►  Strict Helmet HTTP Headers (`X-Frame-Options: DENY`, `nosniff`)
│ A07: Auth & ID Failures       │ ──►  Automatic Refresh Token Rotation + Instant Session Revocation API
│ A09: Logging & Monitoring     │ ──►  Immutable AuditLog Pipeline capturing Actor, IP, User-Agent, State Diffs
└───────────────────────────────┘
```

---

## 🔑 2. Cryptographic Token & Session Lifecycle

### Access Token (JWT)
- **Algorithm**: `HS256` signed with `JWT_SECRET`.
- **Payload**: `{ "sub": "<userId>", "sid": "<sessionId>", "iat": ..., "exp": ... }`.
- **Lifespan**: 15 minutes.
- **Verification**: Evaluated synchronously by `authenticate` middleware; also validated against active DB `Session` record to ensure real-time revocation support.

### Refresh Token & Rotation
- **Token Format**: 73-character high-entropy string (`randomUUID() + '.' + randomUUID()`).
- **Database Storage**: Raw refresh tokens are **NEVER** stored in plain text. Only the SHA-256 hash (`crypto.createHash('sha256').update(token).digest('hex')`) is stored in `refresh_tokens.token_hash`.
- **Rotation Mechanics**: Calling `/api/v1/auth/refresh` automatically marks the old refresh token record as `revoked: true` and issues a brand-new token pair. If a revoked refresh token is presented, all refresh tokens for that user are invalidated immediately (Detects Token Reuse Attacks).

---

## 🌐 3. HTTP Security Headers

Security headers are injected unconditionally at the Next.js `middleware.ts` layer:

```typescript
response.headers.set('X-Frame-Options', 'DENY');                      // Prevents Clickjacking
response.headers.set('X-Content-Type-Options', 'nosniff');            // Prevents MIME Sniffing
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
response.headers.set('X-XSS-Protection', '1; mode=block');            // Legacy XSS Protection
```

---

## ⏱️ 4. Rate Limiting Strategy (`rateLimiter.ts`)

To protect against automated brute-force attacks and resource exhaustion, rate limiters are configured using `express-rate-limit`:

| Limiter Instance | Target Endpoint Domain | Window Size | Max Requests (Prod Mode) |
| :--- | :--- | :--- | :--- |
| `authRateLimiter` | `/api/v1/auth/login`, `/register` | 15 Minutes | 10 Requests per IP |
| `aiRateLimiter` | `/api/v1/digest/generate` | 15 Minutes | 15 Requests per User |
| `uploadRateLimiter` | `/api/v1/tickets/:id/attachments` | 15 Minutes | 30 Uploads per User |
| `inviteRateLimiter` | `/api/v1/organizations/:id/invitations`| 15 Minutes | 20 Invitations per User |
| `generalRateLimiter`| All General API Endpoints | 15 Minutes | 500 Requests per IP |

> [!NOTE]
> During automated test execution and demo evaluation, setting `SKIP_RATE_LIMIT=true` in `.env` increases rate limit thresholds to 10,000 requests to prevent test false positives.

---

## 📜 5. Audit Logging Pipeline & Compliance

The audit subsystem (`src/services/audit.service.ts`) logs every state-modifying action (`REGISTER`, `LOGIN`, `CREATE_ORGANIZATION`, `INVITE_MEMBER`, `UPDATE_ROLE`, `DELETE_TICKET`, `APPROVE_REVIEW`) to the `audit_logs` table.

### Captured Audit Attributes
- `actorId` & `actorEmail`: Identity of the triggering user.
- `actorRole`: Role assumed during action execution.
- `organizationId`: Tenant workspace context.
- `module` & `action`: Functional module (e.g. `AUTHENTICATION`, `ORGANIZATION`, `TICKET`) and action name.
- `previousState` & `newState`: JSON snapshots of entity state prior to and after modification.
- `ipAddress` & `userAgent`: Network origin and browser signature.
- `requestId`: Correlation ID matching `x-request-id` header for distributed tracing.
