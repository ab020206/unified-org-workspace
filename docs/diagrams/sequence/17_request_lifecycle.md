# Diagram 17 — Request Execution Lifecycle Diagram

This diagram details the step-by-step HTTP execution path through the 8 middleware stages, controller handler, service method, repository layer, and response formatting.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
sequenceDiagram
    autonumber
    actor Client as HTTP Client
    participant MW1 as requestId & logging
    participant MW2 as rateLimiter & sanitize
    participant MW3 as authenticate
    participant MW4 as tenantContext
    participant MW5 as resolvePermissions & requirePermission
    participant Ctrl as TicketController
    participant Svc as TicketService
    participant DB as PostgreSQL DB

    Client->>MW1: HTTP POST /api/v1/tickets (Bearer token, Header: x-organization-id)
    MW1->>MW1: Attach x-request-id & start Pino timer
    MW1->>MW2: Forward request
    MW2->>MW2: Verify IP rate limits & sanitize body
    MW2->>MW3: Forward request

    MW3->>MW3: Verify JWT token & check Session table in DB
    MW3->>MW4: Forward request (req.user attached)
    
    MW4->>MW4: Extract x-organization-id & verify active OrganizationMember
    MW4->>MW5: Forward request (req.organization attached)

    MW5->>MW5: Compute effective permissions & assert ticket.create permission
    MW5->>Ctrl: Call createTicket(req, res)

    Ctrl->>Svc: createTicket(orgId, userId, payload)
    Svc->>DB: INSERT INTO tickets ... RETURNING *
    DB-->>Svc: Ticket Record
    Svc-->>Ctrl: Ticket Dto
    Ctrl-->>Client: HTTP 201 Created (ApiResponse<TicketDto>)
```
