# Test Architecture & 65-Assertion Suite Specification

This document describes the test architecture, test execution environment, assertion suites, and verification coverage of the **Unified Organization Workspace** master test runner (`tests/testRunner.ts`).

---

## 🧪 1. Test Architecture Overview

The testing framework is built using Node.js `assert`, `supertest` for API HTTP integration assertions, and TypeScript `tsx` test runners. Tests run directly against an active or simulated PostgreSQL database to verify real Prisma ORM behavior, database cascades, and middleware execution.

```
                           ┌──────────────────┐
                           │ tests/testRunner │
                           └────────┬─────────┘
                                    │
    ┌───────────────────┬───────────┴───────────┬───────────────────┐
    │                   │                       │                   │
┌───▼───────────┐   ┌───▼───────────┐       ┌───▼───────────┐   ┌───▼───────────┐
│ Unit Tests    │   │  Integration  │       │ Security Suite│   │ E2E Journeys  │
│ Auth & RBAC   │   │  API Routes   │       │ Authz Guards  │   │ User Flows    │
└───────────────┘   └───────────────┘       └───────────────┘   └───────────────┘
```

---

## 📊 2. Master Test Suite Structure (65 Assertions)

The master test runner (`npm run test`) executes 65 sequential assertions spanning 6 major phases:

### Phase 1: Authentication & Identity Suite (Tests 1 - 5)
- User Registration (`POST /api/v1/auth/register`) creating default workspace.
- User Login (`POST /api/v1/auth/login`) issuing valid JWT and Refresh Token.
- Profile Retrieval (`GET /api/v1/auth/me`) validating user payload fields.
- Session Listing (`GET /api/v1/auth/sessions`) verifying active DB session records.
- Token Refresh Rotation (`POST /api/v1/auth/refresh`) asserting old token revocation and new token issuance.

### Phase 2: Organization & Tenant Management Suite (Tests 6 - 15)
- Non-platform user organization creation attempt (Assuring 403 Forbidden).
- Platform Super Admin organization creation (`Org Beta Workspace`).
- Member Onboarding Wizard (`POST /api/v1/organizations/:id/onboard`).
- Member Direct Creation & Role Updates (`ADMIN`, `SUPPORT_AGENT`, `REVIEWER`, `GUEST`, `AUDITOR`).
- Permission Override Verification (`PermissionOverride` grant & revoke in DB).

### Phase 3: Support Ticket Subsystem Suite (Tests 16 - 30)
- Support Ticket Creation with Priority (`HIGH`, `URGENT`) and Category (`BUG`, `TECHNICAL`).
- Ticket Assignment to Support Agent (`POST /api/v1/tickets/:id/assign`).
- Ticket Comment Threading & Status State Machine Transitions (`OPEN` -> `IN_PROGRESS` -> `RESOLVED`).
- Attachment Metadata Persistence.

### Phase 4: Code Review & Pull Request Suite (Tests 31 - 45)
- Pull Request Creation in `DRAFT` status.
- Reviewer Assignment (`PullRequestReviewer`).
- Review Decision Submittals (`APPROVED`, `CHANGES_REQUESTED`).
- PR Merge Authorization Check (`POST /api/v1/pull-requests/:id/merge`).

### Phase 5: Cross-Organization Sharing & AI Digest Suite (Tests 46 - 55)
- Organization Connection Request (`sourceOrg` -> `targetOrg`).
- Shared Resource Creation (`SharedResource` for ticket read access).
- Guest User Access Verification via Shared Token.
- Async Digest Job Enqueue & Worker Processor Execution (`DigestQueue` & `digest.worker.ts`).
- Notification Dispatch & Read Receipt Update (`PATCH /api/v1/notifications/:id/read`).

### Phase 6: Security & Performance Suite (Tests 56 - 65)
- Unauthorized Route Access Checks (Missing Bearer Token -> 401 Unauthorized).
- Invalid Role Permission Access Checks (Guest calling DELETE -> 403 Forbidden).
- Tenant Isolation Data Boundary Verification (User from Org A cannot query Org B tickets).
- Database Query Latency Assertions (Verifying sub-50ms query execution).

---

## 🏃 3. Executing Tests Locally

Run the complete test suite with one command:

```bash
npm run test
```

Expected Output:

```text
🧪 Starting Unified Workspace Comprehensive Phase 1 - 9 Master Test Suite...
  [1/65] Testing POST /api/v1/auth/register (Admin)... PASSED
  [2/65] Testing POST /api/v1/auth/login... PASSED
  ...
  [65/65] Verifying Audit Analytics Endpoint... PASSED
🎉 ALL 65 MASTER TEST ASSERTIONS PASSED CLEANLY!
```
