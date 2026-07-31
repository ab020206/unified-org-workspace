# Role-Based Access Control (RBAC) & Permission Engine

This document defines the Role-Based Access Control (RBAC) architecture, role hierarchies, default permission matrices, DB-driven permission overrides, and evaluation algorithms of the **Unified Organization Workspace**.

---

## 👥 1. Role Definitions & Hierarchy

The application defines 6 distinct roles in the `Role` enum (`types/rbac.ts` & `prisma/schema.prisma`):

| Role Enum | Title | Scope & Level of Access |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Platform Super Admin | Full unrestricted global access across all platform organizations and system settings. |
| `ADMIN` | Organization Administrator | Complete administrative access within a specific tenant workspace. |
| `SUPPORT_AGENT` | Support Lead / Specialist | Ticket management, ticket assignment, commenting, and read-only review access. |
| `REVIEWER` | Technical Reviewer | Code review operations, PR approval, PR rejection, PR status updates. |
| `GUEST` | Guest / Client Viewer | Read-only access to specifically shared tickets and pull requests. |
| `AUDITOR` | Compliance Officer | Read-only inspection of security audit logs and audit analytics dashboards. |

---

## 🔑 2. Fine-Grained Permissions Matrix

The platform defines 25 granular permissions grouped into domain categories (`types/rbac.ts`):

```
Organization:  organization.read | organization.create | organization.update | organization.delete | organization.invite | organization.remove_member | organization.manage_members
Tickets:       ticket.read | ticket.create | ticket.update | ticket.delete | ticket.assign
Reviews:       review.read | review.create | review.update | review.approve | review.reject | review.merge
Audit & Sys:   audit.read | audit.analytics_read | anomaly.acknowledge | system.admin
Integrations:  github.read | github.manage | share.create | share.accept | notification.read | notification.manage
```

### Role Default Permission Assignment (`DEFAULT_ROLE_PERMISSIONS`)

```typescript
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // All 25 permissions

  [Role.ADMIN]: [
    Permission.ORG_READ, Permission.ORG_CREATE, Permission.ORG_UPDATE, Permission.ORG_DELETE,
    Permission.ORG_INVITE, Permission.ORG_REMOVE_MEMBER, Permission.ORG_MANAGE_MEMBERS,
    Permission.TICKET_READ, Permission.TICKET_CREATE, Permission.TICKET_UPDATE, Permission.TICKET_DELETE, Permission.TICKET_ASSIGN,
    Permission.REVIEW_READ, Permission.REVIEW_CREATE, Permission.REVIEW_UPDATE, Permission.REVIEW_APPROVE, Permission.REVIEW_REJECT, Permission.REVIEW_MERGE,
    Permission.AUDIT_READ, Permission.AUDIT_ANALYTICS_READ, Permission.ANOMALY_ACKNOWLEDGE,
    Permission.GITHUB_READ, Permission.GITHUB_MANAGE, Permission.SHARE_CREATE, Permission.SHARE_ACCEPT, Permission.NOTIFICATION_READ, Permission.NOTIFICATION_MANAGE
  ],

  [Role.SUPPORT_AGENT]: [
    Permission.ORG_READ, Permission.TICKET_READ, Permission.TICKET_CREATE, Permission.TICKET_UPDATE, Permission.TICKET_ASSIGN,
    Permission.REVIEW_READ, Permission.NOTIFICATION_READ, Permission.SHARE_ACCEPT
  ],

  [Role.REVIEWER]: [
    Permission.ORG_READ, Permission.TICKET_READ, Permission.REVIEW_READ, Permission.REVIEW_CREATE, Permission.REVIEW_UPDATE,
    Permission.REVIEW_APPROVE, Permission.REVIEW_REJECT, Permission.GITHUB_READ, Permission.NOTIFICATION_READ
  ],

  [Role.GUEST]: [
    Permission.ORG_READ, Permission.TICKET_READ, Permission.REVIEW_READ, Permission.NOTIFICATION_READ
  ],

  [Role.AUDITOR]: [
    Permission.ORG_READ, Permission.AUDIT_READ, Permission.AUDIT_ANALYTICS_READ, Permission.NOTIFICATION_READ
  ]
};
```

---

## 🛠️ 3. DB-Driven Permission Overrides (`PermissionOverride`)

To support enterprise requirements where individual members require custom permissions without elevating their overall role, the platform provides the `PermissionOverride` model in PostgreSQL (`permission_overrides` table).

### Override Schema
- `memberId`: References `OrganizationMember.id`.
- `permission`: String representation of `Permission` (e.g. `ticket.delete`).
- `allowed`: Boolean (`true` grants permission, `false` explicitly revokes permission).
- Unique Index: `[memberId, permission]`.

---

## ⚡ 4. Permission Evaluation Algorithm

Permission resolution is executed in `PermissionService.getEffectivePermissions()` following a deterministic 3-step evaluation sequence:

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Platform Super Admin Check                          │
│ Is member role == SUPER_ADMIN?                              │
│ ├── YES ──► Return ALL 25 Permissions immediately (Bypass) │
│ └── NO ───► Proceed to Step 2                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Step 2: Hydrate Role Default Permissions                     │
│ Initialize Permission Set = DEFAULT_ROLE_PERMISSIONS[role]  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Step 3: Apply Member Permission Overrides                    │
│ Fetch PermissionOverride records for memberId from database   │
│ FOR EACH override IN overrides:                             │
│   IF override.allowed == true:                              │
│      Permission Set.add(override.permission)                │
│   ELSE IF override.allowed == false:                        │
│      Permission Set.delete(override.permission)             │
│ Return Array.from(Permission Set)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ 5. Enforcement in API Routes

Permission authorization is enforced using the `requirePermission` middleware wrapper:

```typescript
// Route Enforcement Example
router.post(
  '/tickets',
  authenticate,
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.TICKET_CREATE),
  ticketController.createTicket
);
```

If `requirePermission` fails, the request is halted immediately with a `403 Forbidden` response and an audit log event is recorded detailing the unauthorized attempt.
