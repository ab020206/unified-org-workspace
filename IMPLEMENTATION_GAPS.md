# Technical Implementation Gaps & Architectural Nuances Audit

This document details the engineering review of potential implementation gaps, edge cases, and design constraints addressed during the pre-submission audit of the **Unified Workspace** platform.

---

## 1. Architectural & Boundary Gaps Addressed

### Dual-Dashboard Context Synchronization
- **Challenge**: The assignment requires Support Hub (Dashboard 1) and Review & Audit Console (Dashboard 2) to operate as a single coherent product sharing one identity layer without data owning duplication.
- **Resolution**: Implemented centralized Identity and Organization management in `server/src/services/organization.service.ts` and `auth.service.ts`. The client uses `AuthContext` with automatic token refresh, active organization switching (`PATCH /api/v1/organizations/switch`), and synchronized session state across all routes.

### BOLA (Broken Object Level Authorization) Protection
- **Challenge**: Preventing direct object ID tampering across tenants when querying tickets, pull requests, attachments, or audit records.
- **Resolution**: Implemented mandatory organization filtering at the database repository query layer. Every read and write query explicitly mandates `where: { organizationId: activeOrgId }` or checks `SharedResource` permissions for cross-org guests. Direct API calls tampering with IDs return HTTP 404 (or HTTP 403 Forbidden) rather than exposing resource existence or leaking data. Verified via automated security tests in [security.test.ts](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/server/tests/security/security.test.ts).

---

## 2. Multi-Tenancy & Cross-Org Sharing Nuances

### Item-Level Granular Sharing vs Workspace Leakage
- **Challenge**: When an organization connects with a partner organization, users from the partner must only access specific explicitly shared tickets or PRs—never full workspace access.
- **Resolution**: Introduced the `SharedResource` join table linked to `OrganizationConnection`. Cross-org partner users are mapped as `Role.GUEST` for external contexts. Scoping middleware evaluates item-level access before granting read/comment rights.

### Restricted Guest Rights Enforcement
- **Challenge**: Guests must be strictly limited to view and comment operations. Attempting to edit, delete, or change status on shared items must be blocked.
- **Resolution**: Backend RBAC middleware (`permission.service.ts`) enforces strict read/comment permission flags for `Role.GUEST`. UI components (`GuestDashboard.tsx`, detail pages) suppress action buttons (edit, delete, resolve, merge) when viewed under guest scope.

---

## 3. Review & Audit Console (PR State & Versioning)

### Configurable "Requires N Approvals" Workflow
- **Challenge**: PR approval state transitions must respect dynamic organization or PR-level review rules.
- **Resolution**: The `PullRequest` entity tracks required approval counts (`requiresApprovals`). The `pullRequest.service.ts` validates that the count of active `APPROVED` reviews satisfies `requiresApprovals` before transitioning status to `APPROVED` or allowing `MERGED`.

### Immutable Versioning & Diff Snapshots
- **Challenge**: Any edits made to a PR description or title after review has commenced must preserve history and render visual diffs against prior versions.
- **Resolution**: Whenever a PR with status `IN_REVIEW` or `APPROVED` is updated, the service automatically creates a new `PullRequestVersion` record recording the previous payload. The client diff viewer ([PullRequestDiffViewer.tsx](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/client/components/prs/PullRequestDiffViewer.tsx)) computes side-by-side string diffs.

---

## 4. AI Progress Tracker & Notification Pipeline

### Background Processing vs Page-Load Computation
- **Challenge**: AI progress digests must be generated asynchronously on schedule without blocking HTTP responses or page rendering.
- **Resolution**: Integrated `digestWorker.ts` background scheduler operating on a configurable cron schedule. Digests are pre-computed, stored in `AIDigest` records, and delivered directly to the user's notification bell (`NotificationBell.tsx`).

### Strict Privacy & Cross-Tenant Boundary
- **Challenge**: Ensuring LLM prompts and digest calculations never ingest data from non-partner or unshared tenant entities.
- **Resolution**: The background worker constructs LLM context strictly by querying `where: { organizationId }` for own org resources plus explicitly shared `SharedResource` entries. Verified by automated test suite.

---

## 5. Summary of Edge-Case Resilience

| Scenario | Potential Risk | Mitigation / Design Pattern |
| :--- | :--- | :--- |
| **Session Expiry** | Unhandled 401 exceptions | Automatic refresh token exchange in `api.ts` interceptor with fallback redirect to `/login`. |
| **Concurrent PR Approvals** | Race condition approving PR | Transactional status updates in `pullRequest.service.ts` with DB lock checks. |
| **Orphaned Attachments** | Storage bloat on deleted tickets | Cascade deletion rules in Prisma schema and local disk upload cleanup. |
| **Empty State Dashboards** | Poor user onboarding | Custom empty state components (`EmptyState.tsx`) tailored for each role. |
