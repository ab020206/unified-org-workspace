# Identity & Organization Service Specification

This document details the complete design, authentication flows, token lifecycles, tenant isolation mechanics, organization switching, role resolution, permission overrides, and cross-organization sharing model of the **Unified Organization Workspace**.

---

## 🔐 1. Authentication Architecture

Authentication is implemented using a **Hybrid JWT & Database-Backed Session** model designed for enterprise security and instant session revocation capability.

```
┌──────────────┐          1. POST /api/v1/auth/login           ┌──────────────┐
│  Client App  │ ─────────────────────────────────────────────►│ Auth Controller│
└──────┬───────┘                                               └──────┬───────┘
       │                                                              │
       │ 2. Return Auth Tokens & Session Payload                      │ 2. Verify Credentials
       │    - accessToken (JWT, 15m)                                  │    - Bcrypt check
       │    - refreshToken (Hashed UUID, 7d)                          │    - Create Session DB record
       │    - active organizationId                                   │    - Create RefreshToken DB record
       ▼                                                              ▼
┌──────────────┐                                               ┌──────────────┐
│ AuthContext  │                                               │ PostgreSQL   │
│ LocalStorage │                                               │ Session &    │
│ & Cookies    │                                               │ RefreshToken │
└──────────────┘                                               └──────────────┘
```

### Key Components & Implementations
1. **Password Security**: Passwords are hashed using `bcryptjs` with 10 salt rounds (`AuthService.register()`).
2. **Access Tokens**: Short-lived JSON Web Tokens (JWT) with a 15-minute expiration containing user ID (`sub`) and session ID (`sid`) signed with `JWT_SECRET`.
3. **Refresh Tokens**: Opaque double-UUID string (`randomUUID() + '.' + randomUUID()`) stored in the `RefreshToken` database table as a SHA-256 hash.
4. **Token Rotation**: Every call to `/api/v1/auth/refresh` revokes the old refresh token record and issues a new access token and refresh token pair.
5. **Session Validation**: Every HTTP request passing through `authenticate` middleware checks that `session.expiry > new Date()` in the database and updates `lastActivity`.

---

## 🏢 2. Organization Engine & Multi-Tenancy

### Tenant Resolution Architecture (`tenantContext.ts`)
The `tenantContext` middleware resolves active organization context for every request following a 5-step fallback pipeline:

```
Step 1: Inspect 'x-organization-id' Request Header
  ├── Found? Check user membership in OrganizationMember
  └── Not Found? Step 2

Step 2: Inspect 'active_org_id' Cookie
  ├── Found? Check user membership
  └── Not Found? Step 3

Step 3: Inspect 'organizationId' Query Parameter
  ├── Found? Check user membership
  └── Not Found? Step 4

Step 4: Platform Super Admin Check
  ├── User has 'isPlatformUser === true'? Set org context to 'Platform View'
  └── Regular User? Step 5

Step 5: Fallback to User's First Active Organization
  ├── Found? Select first organization from user's memberships
  └── No Orgs? Return 403 Forbidden ("User does not belong to any active organization")
```

---

## 🔄 3. Organization Switching Mechanics

When a user switches organizations in the UI via `OrgSwitcher.tsx`:
1. Client calls `switchOrganization(targetOrgId)` in `AuthContext.tsx`.
2. Client updates local state and sets cookie `active_org_id = targetOrgId`.
3. React Query cache is invalidated (`queryClient.invalidateQueries()`), clearing stale tenant data.
4. Subsequent API calls include header `x-organization-id: targetOrgId`.
5. Server `tenantContext` middleware validates that the user possesses an active `OrganizationMember` record in `targetOrgId`.
6. Server attaches `req.organization` and `req.membership` context to the request object.

---

## 🔀 4. Cross-Organization Resource Sharing

To allow secure collaboration between distinct organizations without breaking tenant isolation boundaries, the platform implements **Organization Connections** and **Shared Resources**.

### Model Schemas (`schema.prisma`)
- `OrganizationConnection`: Represents a peer-to-peer relationship between `sourceOrganizationId` and `targetOrganizationId` with statuses `PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`, `REVOKED`.
- `SharedResource`: Links a specific resource (`TICKET` or `PULL_REQUEST`) from `ownerOrganizationId` to `sharedWithOrganizationId` with granular permissions (`READ`, `COMMENT`, `REVIEW`, `APPROVE`, `FULL_ACCESS`) and optional expiration timestamp (`expiresAt`).
- `SharedAccess`: Tracks guest user access logs and access timestamps.

---

## 🛡️ 5. Tenant Security & Isolation Boundaries

1. **Database Level**: All domain models (`Ticket`, `PullRequest`, `AuditLog`, `Digest`, `Notification`) contain an explicit `organizationId` foreign key with `ON DELETE CASCADE`.
2. **API Level**: All database query filters enforce `where: { organizationId }` derived strictly from `req.organization.id` set by `tenantContext` middleware.
3. **Cross-Tenant Guard**: Users cannot access resources in an organization where they lack active membership unless explicit `SharedResource` permission exists.
