# API Architecture & Endpoint Directory

This document details the API route structure, HTTP request lifecycle, middleware pipeline sequence, error handling standards, and comprehensive endpoint directory of the **Unified Organization Workspace**.

---

## 🛣️ 1. API Architecture & Routing Strategy

The platform uses a unified dual-routing architecture:
1. **Next.js App Router API Routes (`app/api/*`)**: Handles edge routes, health checks, platform telemetry, public auth endpoints, and client-side serverless actions.
2. **Express Service Routes (`src/routes/*`)**: Handles complex domain logic, controller interactions, transactional database services, file uploads, and background worker triggers.

All REST API endpoints conform to standard JSON payload structures (`ApiResponse<T>`):

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## ⚡ 2. Request Execution & Middleware Pipeline

Every incoming HTTP request traverses a structured 8-stage middleware pipeline before reaching the target controller:

```
Request ──► [1. requestId] ──► [2. logging (Pino)] ──► [3. rateLimiter] 
        ──► [4. sanitize]   ──► [5. authenticate]  ──► [6. tenantContext] 
        ──► [7. resolvePermissions] ──► [8. requirePermission] ──► Controller
```

| Middleware Stage | File Path | Function / Responsibility |
| :--- | :--- | :--- |
| **1. Request ID** | `src/middleware/requestId.ts` | Generates unique UUID `x-request-id` header for request tracing. |
| **2. Logging** | `src/middleware/logging.ts` | Logs HTTP method, URL, status code, and latency via Pino logger. |
| **3. Rate Limiter** | `src/middleware/rateLimiter.ts` | Prevents DoS/Brute-force attacks (`authRateLimiter`, `generalRateLimiter`). |
| **4. Sanitization** | `src/middleware/sanitize.middleware.ts` | Sanitizes body parameters to mitigate XSS and script injection attacks. |
| **5. Authentication** | `src/middleware/authenticate.ts` | Verifies JWT Access Token & validates DB Session activity. |
| **6. Tenant Context** | `src/middleware/tenantContext.ts` | Resolves tenant ID from `x-organization-id` header/cookie & verifies active membership. |
| **7. Resolve Permissions** | `src/middleware/authorize.ts` | Computes effective permissions combining role defaults & DB overrides. |
| **8. Require Permission** | `src/middleware/authorize.ts` | Asserts that `req.permissions` includes requested permission; throws 403 if missing. |

---

## 📑 3. Comprehensive Endpoint Directory

### 🔐 Authentication Module (`/api/v1/auth`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user & auto-create default workspace. |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user credentials & issue JWT + Refresh tokens. |
| `POST` | `/api/v1/auth/refresh` | Public | Rotate refresh token & issue fresh 15m access token. |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke refresh token & destroy active DB session. |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current user payload and active workspace details. |

### 🏢 Organization Module (`/api/v1/organizations`)

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/organizations` | Authenticated | List all active organizations user belongs to. |
| `POST` | `/api/v1/organizations` | `system.admin` / Platform | Provision a new tenant organization. |
| `GET` | `/api/v1/organizations/:id` | `organization.read` | Fetch organization profile and member statistics. |
| `PATCH` | `/api/v1/organizations/:id` | `organization.update` | Update organization profile name, logo, or settings. |
| `POST` | `/api/v1/organizations/:id/onboard` | `organization.update` | Execute enterprise organization onboarding wizard. |
| `GET` | `/api/v1/organizations/:id/members` | `organization.read` | List all active organization members. |
| `POST` | `/api/v1/organizations/:id/members` | `organization.manage_members` | Directly add a new member to the organization. |
| `PATCH` | `/api/v1/organizations/:id/members/:mId` | `organization.manage_members` | Update member role or permission overrides. |
| `DELETE` | `/api/v1/organizations/:id/members/:mId` | `organization.remove_member` | Soft-delete/deactivate member from organization. |

### 🎫 Support Tickets Module (`/api/v1/tickets`)

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tickets` | `ticket.read` | List workspace support tickets with status/priority filters. |
| `POST` | `/api/v1/tickets` | `ticket.create` | Create a new support ticket. |
| `GET` | `/api/v1/tickets/:id` | `ticket.read` | Fetch detailed ticket details, comments, and attachments. |
| `PATCH` | `/api/v1/tickets/:id` | `ticket.update` | Update ticket status, priority, or category. |
| `POST` | `/api/v1/tickets/:id/assign` | `ticket.assign` | Assign ticket to support agent. |
| `POST` | `/api/v1/tickets/:id/comments` | `ticket.read` | Add comment to ticket thread. |

### 🔀 Pull Requests & Reviews Module (`/api/v1/pull-requests`)

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pull-requests` | `review.read` | List pull requests for current workspace. |
| `POST` | `/api/v1/pull-requests` | `review.create` | Submit a new pull request for code review. |
| `POST` | `/api/v1/pull-requests/:id/reviews` | `review.approve` / `review.reject` | Submit official review decision (`APPROVED`, `CHANGES_REQUESTED`, `REJECTED`). |
| `POST` | `/api/v1/pull-requests/:id/merge` | `review.merge` | Execute pull request merge. |

### 🤖 AI Digest & Notifications Module

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/digest` | `notification.read` | Fetch user's latest AI activity digest briefings. |
| `POST` | `/api/v1/digest/generate` | `notification.read` | Enqueue background AI Digest generation job. |
| `GET` | `/api/v1/notifications` | `notification.read` | List in-app notifications for active user. |
| `PATCH` | `/api/v1/notifications/:id/read` | `notification.read` | Mark notification as read. |

### 🛡️ Audit & Security Module (`/api/v1/audit`)

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/audit` | `audit.read` | Search security audit logs with module/action filters. |
| `GET` | `/api/v1/audit/analytics` | `audit.analytics_read` | Fetch audit volume analytics and security event breakdowns. |
