# Database Architecture & Entity Specifications

This document defines the relational database architecture, entity-relationship topology, indexes, constraints, and 21 Prisma models of the **Unified Organization Workspace**.

---

## 🗄️ 1. Database Overview

- **Database Engine**: PostgreSQL (compatible with Neon Serverless Postgres).
- **ORM Framework**: Prisma ORM v5.14 (`@prisma/client`).
- **Schema Location**: `prisma/schema.prisma`.
- **Entity Count**: 21 relational models and 10 custom enums.

---

## 📐 2. Complete Entity Model Directory

### Core Identity & Multi-Tenancy Models
1. **`User` (`users`)**: Primary identity entity. Fields: `id`, `firstName`, `lastName`, `email`, `passwordHash`, `avatar`, `emailVerified`, `isActive`, `isPlatformUser`, timestamps.
2. **`Organization` (`organizations`)**: Tenant organization entity. Fields: `id`, `name`, `slug`, `logo`, `createdBy`, timestamps.
3. **`OrganizationMember` (`organization_members`)**: User-to-Organization join table. Unique constraint `[organizationId, userId]`. Contains `role` (`Role` enum).
4. **`PermissionOverride` (`permission_overrides`)**: DB-level permission grant (`allowed: true`) or revoke (`allowed: false`) for a specific member. Unique constraint `[memberId, permission]`.

### Auth & Session Models
5. **`Session` (`sessions`)**: Tracks active user HTTP sessions. Fields: `id`, `userId`, `device`, `browser`, `ip`, `lastActivity`, `expiry`.
6. **`RefreshToken` (`refresh_tokens`)**: Stores hashed refresh tokens. Fields: `id`, `tokenHash`, `userId`, `device`, `expiry`, `revoked`.
7. **`Invitation` (`invitations`)**: Workspace email invitations. Fields: `id`, `organizationId`, `email`, `invitedBy`, `role`, `token`, `expiry`, `acceptedAt`.

### Support Ticket Subsystem
8. **`Ticket` (`tickets`)**: Support ticket entity. Fields: `id`, `organizationId`, `ticketNumber`, `title`, `description`, `status` (`TicketStatus`), `priority` (`TicketPriority`), `category` (`TicketCategory`), `createdBy`, `assignedTo`, timestamps.
9. **`TicketComment` (`ticket_comments`)**: Threaded ticket discussion comments.
10. **`TicketAttachment` (`ticket_attachments`)**: File attachments metadata (`fileName`, `fileUrl`, `mimeType`, `fileSize`).
11. **`TicketActivity` (`ticket_activities`)**: Audit trail of ticket status/field changes (`oldValue`, `newValue`).

### Pull Request & Review Subsystem
12. **`PullRequest` (`pull_requests`)**: Code review pull request entity. Fields: `id`, `organizationId`, `prNumber`, `title`, `description`, `status` (`PullRequestStatus`), `createdBy`, `mergedBy`, `requiredApprovals`, GitHub sync metadata (`githubPrId`, `headBranch`, `baseBranch`, `ciStatus`).
13. **`PullRequestReviewer` (`pull_request_reviewers`)**: Assigned code reviewers. Unique constraint `[pullRequestId, reviewerId]`.
14. **`ReviewDecision` (`review_decisions`)**: Official reviewer decisions (`APPROVED`, `CHANGES_REQUESTED`, `REJECTED`).
15. **`PullRequestVersion` (`pull_request_versions`)**: Snapshot of PR iterations.
16. **`ReviewComment` (`review_comments`)**: PR comments.
17. **`PullRequestActivity` (`pull_request_activities`)**: Activity audit log for PRs.

### Audit & Security Subsystem
18. **`AuditLog` (`audit_logs`)**: Immutable security audit records. Fields: `id`, `organizationId`, `actorId`, `actorEmail`, `actorRole`, `module`, `action`, `entityType`, `entityId`, `previousState` (JSON), `newState` (JSON), `ipAddress`, `userAgent`, `requestId`.
19. **`AuditMetadata` (`audit_metadata`)**: Key-value pair extensions for audit logs.

### Cross-Organization & Integration Subsystem
20. **`OrganizationConnection` (`organization_connections`)**: Peer org connections (`PENDING`, `ACCEPTED`, `BLOCKED`). Unique constraint `[sourceOrganizationId, targetOrganizationId]`.
21. **`SharedResource` (`shared_resources`)**: Cross-org shared tickets/PRs. Unique constraint `[resourceType, resourceId, sharedWithOrganizationId]`.

---

## ⚡ 3. Indexing & Performance Strategy

To ensure sub-10ms query execution times under heavy multi-tenant load, the database schema implements composite indexes targeting common access patterns:

```prisma
// High-Traffic Organization Indexing
@@index([organizationId])
@@index([organizationId, status])
@@index([organizationId, priority])
@@index([organizationId, createdAt])
@@index([organizationId, status, createdAt])

// User Activity Indexing
@@index([userId])
@@index([actorId, createdAt])

// Audit Trail Indexing
@@index([module])
@@index([action])
@@index([createdAt])
```

---

## 🔗 4. Referential Integrity & Cascades

- **`ON DELETE CASCADE`**: Applied to tenant-child entities (`OrganizationMember`, `Ticket`, `PullRequest`, `Digest`, `Notification`). When an organization or user is deleted, all owned resources are cleanly garbage collected.
- **`ON DELETE SET NULL`**: Applied to optional relational fields (e.g., `Ticket.assignedTo`, `PullRequest.mergedBy`, `AuditLog.organizationId`). This ensures audit logs and historic tickets remain intact even if the assigning admin or organization is soft-deleted.
