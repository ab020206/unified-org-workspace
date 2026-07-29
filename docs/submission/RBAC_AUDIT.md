# Role-Based Access Control (RBAC) Audit Report

This document presents a granular RBAC verification of all six system roles in the **Unified Workspace** application, evaluating dashboard UI, sidebar navigation, widget scoping, action capabilities, and backend API permission enforcement.

---

## 1. Role-by-Role RBAC Scope & Dashboard Audit

### 👑 Platform Super Admin

- **Scope**: Global platform governance across all organizations, multi-tenant system health, feature flags, global user directory, and platform-wide audit logs.
- **Tenant Association**: `organizationId = NULL`, `organization = null`, `isPlatformUser = true`.
- **Dedicated Dashboard**: [SuperAdminDashboard.tsx](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/client/components/dashboards/SuperAdminDashboard.tsx)
- **Sidebar Navigation**: Dashboard (`/dashboard`), Organizations (`/organizations`), Platform Users (`/users`), Global Audit (`/audit`), Feature Flags (`/feature-flags`), Health (`/health`), Analytics (`/analytics`), Settings (`/settings`).
- **Header UI**: Renders **Platform Governance** badge; Organization Switcher and Tenant Breadcrumbs are hidden.
- **Backend Permissions**: Bypasses tenant scoping; possesses global platform administration capabilities (`ORG_CREATE`, `PLATFORM_MANAGE`, `GLOBAL_AUDIT_VIEW`).

### 🏢 Organization Admin

- **Scope**: Full control within their active organization context across Support Hub (Dashboard 1) and Review Console (Dashboard 2).
- **Tenant Association**: Bound to exactly one active organization (e.g. `Acme Technologies`).
- **Dedicated Dashboard**: [OrgAdminDashboard.tsx](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/client/components/dashboards/OrgAdminDashboard.tsx)
- **Sidebar Navigation**: Dashboard (`/dashboard`), Members (`/members`), Support (`/tickets`), Reviews (`/pull-requests`), Reports (`/reports`), Settings (`/settings`).
- **Header UI**: Renders Organization Switcher (`OrgSwitcher.tsx`) allowing switching between user's member orgs.
- **Backend Permissions**: `ORG_UPDATE`, `ORG_DELETE`, `ORG_INVITE`, `MEMBER_MANAGE`, `ROLE_ASSIGN`, `TICKET_CREATE`, `TICKET_UPDATE`, `PR_CREATE`, `PR_APPROVE`.

### 🎧 Support Agent

- **Scope**: Focused on Dashboard 1 (Support Hub) ticket queues, status updates, SLA tracking, and ticket attachments.
- **Tenant Association**: Bound to active organization.
- **Dedicated Dashboard**: [SupportAgentDashboard.tsx](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/client/components/dashboards/SupportAgentDashboard.tsx)
- **Sidebar Navigation**: Dashboard (`/dashboard`), My Tickets (`/tickets?queue=mine`), Search (`/tickets?search=true`), Notifications (`/notifications`).
- **Forbidden UI Elements**: Organization Settings, Member Invite buttons, Global Audit logs, PR approval buttons are hidden.
- **Backend Permissions**: `TICKET_READ`, `TICKET_UPDATE`, `TICKET_COMMENT`, `TICKET_ATTACHMENT_UPLOAD`.

### 🔍 Reviewer / Approver

- **Scope**: Dual access to Dashboard 2 (Review Console) pull request workflows and Dashboard 1 (Support Hub) ticket reviews, plus Unified Audit Viewer access.
- **Tenant Association**: Bound to active organization.
- **Dedicated Dashboard**: [ReviewerDashboard.tsx](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/client/components/dashboards/ReviewerDashboard.tsx)
- **Sidebar Navigation**: Dashboard (`/dashboard`), Reviews (`/pull-requests`), Approvals (`/pull-requests?status=APPROVED`), History (`/pull-requests?status=history`).
- **Forbidden UI Elements**: Organization Settings, Member Management, Global Feature Flag toggles hidden.
- **Backend Permissions**: `PR_READ`, `PR_REVIEW`, `PR_APPROVE`, `PR_MERGE`, `TICKET_READ`, `AUDIT_LOG_READ`.

### 🤝 Guest Collaborator

- **Scope**: Explicitly granted cross-organization item-level read/comment access for specific shared tickets or PRs from partner orgs.
- **Tenant Association**: Granted through `SharedResource` entries only; no workspace membership.
- **Dedicated Dashboard**: [GuestDashboard.tsx](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/client/components/dashboards/GuestDashboard.tsx)
- **Sidebar Navigation**: Dashboard (`/dashboard`), Shared Resources (`/collaboration`).
- **Forbidden UI Elements**: Restricted to read and comment actions; edit, delete, resolve, approve, and unshared item views are strictly suppressed.
- **Backend Permissions**: `SHARED_RESOURCE_READ`, `TICKET_COMMENT`, `PR_COMMENT`.

### 📊 Read-Only Auditor

- **Scope**: Independent audit logging and compliance oversight; searchable timeline, analytics, and CSV exports.
- **Tenant Association**: Bound to active organization context for organization audit records.
- **Dedicated Dashboard**: [AuditorDashboard.tsx](file:///Users/admin%202/windows%20data/Files%20From%20d.localized/froncort/client/components/dashboards/AuditorDashboard.tsx)
- **Sidebar Navigation**: Dashboard (`/dashboard`), Audit Logs (`/audit`), Reports (`/audit?tab=reports`).
- **Forbidden UI Elements**: Mutating buttons (create, update, delete, merge, approve) are hidden.
- **Backend Permissions**: `AUDIT_LOG_READ`, `REPORT_EXPORT`.

---

## 2. Server-Side Enforcement vs Client Hiding

| Role                     | Client Sidebar Item         | Backend Middleware Guard             | Direct API BOLA Attempt Behavior                                                          |
| :----------------------- | :-------------------------- | :----------------------------------- | :---------------------------------------------------------------------------------------- |
| **Platform Super Admin** | `/organizations`, `/health` | `requirePermission(PLATFORM_MANAGE)` | Granted access to platform endpoints; denied tenant context mutation without ID.          |
| **Org Admin**            | `/members`, `/settings`     | `requirePermission(MEMBER_MANAGE)`   | Enforces `where: { organizationId }`; returns HTTP 403 if modifying another org's member. |
| **Support Agent**        | `/tickets`                  | `requirePermission(TICKET_UPDATE)`   | Enforces `where: { organizationId }`; direct API ticket tampering returns HTTP 404.       |
| **Reviewer**             | `/pull-requests`            | `requirePermission(PR_APPROVE)`      | Validates assigned reviewer status and N-approval count before merge.                     |
| **Guest Collaborator**   | `/collaboration`            | `permission.service.ts` guest check  | Item-level `SharedResource` validation; unshared resource access returns HTTP 404/403.    |
| **Auditor**              | `/audit`                    | `requirePermission(AUDIT_LOG_READ)`  | Read-only enforcement; mutating POST/PUT requests return HTTP 403 Forbidden.              |

---
