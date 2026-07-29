# REST API Reference Specification

Complete REST API endpoint specifications for the **Unified Organization Workspace**.

Base URL: `http://localhost:4000/api/v1`

---

## Standard Headers

- `Authorization`: `Bearer <access_token>` (Required for authenticated endpoints)
- `X-Organization-Id`: `<organization_uuid>` (Required for tenant-scoped operations)
- `Content-Type`: `application/json`

---

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint         | Description                                   | Auth Required |
| :----- | :--------------- | :-------------------------------------------- | :------------ |
| `POST` | `/auth/register` | Register new user & default workspace org     | No            |
| `POST` | `/auth/login`    | Authenticate user & issue tokens              | No            |
| `POST` | `/auth/refresh`  | Rotate refresh token & issue new access token | No            |
| `POST` | `/auth/logout`   | Terminate active session                      | Yes           |
| `GET`  | `/auth/me`       | Fetch active user profile                     | Yes           |

---

## 2. Organization & Membership Endpoints (`/api/v1/organizations`)

| Method  | Endpoint                                    | Description                                   | Permission Required |
| :------ | :------------------------------------------ | :-------------------------------------------- | :------------------ |
| `GET`   | `/organizations`                            | List all organizations for authenticated user | Authenticated       |
| `POST`  | `/organizations`                            | Create secondary organization                 | `ORG_CREATE`        |
| `PATCH` | `/organizations/switch`                     | Switch active workspace context               | Authenticated       |
| `POST`  | `/organizations/invite`                     | Invite new member via email                   | `ORG_INVITE`        |
| `GET`   | `/organizations/invitations/:token`         | Resolve invitation token details              | Public              |
| `POST`  | `/organizations/invitations/accept`         | Accept workspace invitation                   | Authenticated       |
| `GET`   | `/organizations/:id/members`                | List workspace members & roles                | `MEMBER_READ`       |
| `PATCH` | `/organizations/:id/members/:memberId/role` | Update member role                            | `ROLE_MANAGE`       |

---

## 3. Support Hub Ticket Endpoints (`/api/v1/tickets`)

| Method   | Endpoint                   | Description                                          | Permission Required |
| :------- | :------------------------- | :--------------------------------------------------- | :------------------ |
| `GET`    | `/tickets`                 | List workspace tickets with search/filter/pagination | `TICKET_READ`       |
| `POST`   | `/tickets`                 | Create new support ticket                            | `TICKET_CREATE`     |
| `GET`    | `/tickets/stats`           | Fetch ticket dashboard metrics                       | `TICKET_READ`       |
| `GET`    | `/tickets/:id`             | Fetch single ticket details                          | `TICKET_READ`       |
| `PATCH`  | `/tickets/:id`             | Update ticket details/status/assignee                | `TICKET_UPDATE`     |
| `DELETE` | `/tickets/:id`             | Delete support ticket                                | `TICKET_DELETE`     |
| `POST`   | `/tickets/:id/comments`    | Add comment to ticket                                | `TICKET_READ`       |
| `POST`   | `/tickets/:id/attachments` | Upload file attachment to ticket                     | `TICKET_UPDATE`     |
| `GET`    | `/tickets/:id/activity`    | Fetch ticket activity timeline                       | `TICKET_READ`       |

---

## 4. Review Console PR Endpoints (`/api/v1/pull-requests`)

| Method  | Endpoint                       | Description                             | Permission Required |
| :------ | :----------------------------- | :-------------------------------------- | :------------------ |
| `GET`   | `/pull-requests`               | List workspace pull requests            | `REVIEW_READ`       |
| `POST`  | `/pull-requests`               | Create pull request                     | `REVIEW_READ`       |
| `GET`   | `/pull-requests/:id`           | Fetch pull request details              | `REVIEW_READ`       |
| `PATCH` | `/pull-requests/:id`           | Update pull request status              | `REVIEW_READ`       |
| `POST`  | `/pull-requests/:id/reviewers` | Assign reviewers to PR                  | `REVIEW_READ`       |
| `POST`  | `/pull-requests/:id/decisions` | Submit review decision (Approve/Reject) | `REVIEW_APPROVE`    |
| `POST`  | `/pull-requests/:id/versions`  | Upload new code version                 | `REVIEW_READ`       |

---

## 5. Unified Audit Console Endpoints (`/api/v1/audit`)

| Method | Endpoint       | Description                                 | Permission Required |
| :----- | :------------- | :------------------------------------------ | :------------------ |
| `GET`  | `/audit`       | Query audit logs with module/action filters | `AUDIT_READ`        |
| `GET`  | `/audit/stats` | Fetch audit dashboard metrics               | `AUDIT_READ`        |
| `GET`  | `/audit/:id`   | Fetch detailed audit event record           | `AUDIT_READ`        |

---

## 6. Cross-Org Collaboration Endpoints (`/api/v1/connections`, `/sharing`)

| Method  | Endpoint                  | Description                               | Permission Required |
| :------ | :------------------------ | :---------------------------------------- | :------------------ |
| `GET`   | `/connections`            | List organization connections             | `ORG_READ`          |
| `POST`  | `/connections`            | Request connection to target organization | `ORG_UPDATE`        |
| `PATCH` | `/connections/:id/accept` | Accept connection request                 | `ORG_UPDATE`        |
| `POST`  | `/sharing`                | Share resource with connected org         | `ORG_UPDATE`        |
| `GET`   | `/shared`                 | List resources shared with workspace      | `ORG_READ`          |

---

## 7. AI Digest & Notification Endpoints (`/api/v1/digest`, `/notifications`)

| Method  | Endpoint                  | Description                                | Permission Required |
| :------ | :------------------------ | :----------------------------------------- | :------------------ |
| `GET`   | `/digest`                 | Fetch latest AI executive digest           | `ORG_READ`          |
| `POST`  | `/digest/generate`        | Trigger background queue digest generation | `ORG_READ`          |
| `GET`   | `/notifications`          | Fetch user notification inbox              | `ORG_READ`          |
| `PATCH` | `/notifications/:id/read` | Mark notification as read                  | `ORG_READ`          |

---

## 8. Security & Feature Flag Endpoints (`/api/v1/security`, `/feature-flags`)

| Method   | Endpoint                        | Description                      | Permission Required |
| :------- | :------------------------------ | :------------------------------- | :------------------ |
| `GET`    | `/health`, `/live`, `/ready`    | System health & readiness status | Public              |
| `GET`    | `/security/sessions`            | List active sessions for user    | Authenticated       |
| `DELETE` | `/security/sessions/:id`        | Revoke individual session        | Authenticated       |
| `POST`   | `/security/sessions/logout-all` | Terminate all active sessions    | Authenticated       |
| `GET`    | `/feature-flags`                | List workspace feature flags     | Authenticated       |
| `PATCH`  | `/feature-flags/:key`           | Toggle feature flag state        | Admin / Super Admin |
