# Core System Sequence Diagrams

Sequence diagrams illustrating core platform workflows in the **Unified Organization Workspace**.

---

## 1. Authentication & Session Management Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant AuthAPI as Express Auth Router
    participant AuthService as AuthService
    participant DB as PostgreSQL
    participant Redis as Redis Session Cache

    User->>Client: Submit Credentials (Email & Password)
    Client->>AuthAPI: POST /api/v1/auth/login
    AuthAPI->>AuthService: login(data, meta)
    AuthService->>DB: findByEmail(email)
    DB-->>AuthService: User Record & Password Hash
    AuthService->>AuthService: bcrypt.compare(password, passwordHash)
    AuthService->>DB: createSession(userId, expiry, device, IP)
    DB-->>AuthService: Session Record (sid)
    AuthService->>AuthService: generateAccessToken(userId, sid) & generateRefreshToken()
    AuthService->>DB: createRefreshToken(userId, tokenHash)
    AuthService-->>AuthAPI: Auth Tokens & User Payload
    AuthAPI-->>Client: 200 OK (AccessToken, RefreshToken Cookie, User Payload)
    Client-->>User: Navigate to Workspace Dashboard
```

---

## 2. Ticket Creation & Audit Trail Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant API as Express API Pipeline
    participant AuthMW as Auth & Tenant Context MW
    participant PermMW as RBAC Permission MW
    participant TicketService as TicketService
    participant DB as PostgreSQL
    participant AuditService as AuditService

    User->>Client: Click "Create Ticket"
    Client->>API: POST /api/v1/tickets (X-Organization-Id)
    API->>AuthMW: Authenticate Token & Resolve Tenant Context
    AuthMW-->>API: Valid User & Member Context
    API->>PermMW: requirePermission(TICKET_CREATE)
    PermMW-->>API: Permission Granted
    API->>TicketService: createTicket(data, userId, orgId)
    TicketService->>DB: INSERT INTO tickets
    DB-->>TicketService: Created Ticket Record
    TicketService->>AuditService: log(module: SUPPORT_HUB, action: TICKET_CREATE)
    AuditService->>DB: INSERT INTO audit_logs & audit_metadata
    TicketService-->>API: Ticket Payload
    API-->>Client: 201 Created (Ticket Data & Audit Trace ID)
```

---

## 3. AI Digest Background Queue Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant DigestAPI as Digest Router
    participant Queue as BullMQ Redis Queue
    participant Worker as Background Worker
    participant Gemini as Gemini AI Service
    participant DB as PostgreSQL

    User->>Client: Trigger "Generate AI Digest"
    Client->>DigestAPI: POST /api/v1/digest/generate
    DigestAPI->>Queue: addJob("generate-digest", { userId, orgId })
    DigestAPI-->>Client: 202 Accepted (Status: PENDING)

    Queue->>Worker: Dispatch Job Process
    Worker->>DB: Query Recent Tickets, PRs & Audit Logs
    DB-->>Worker: Activity Context Data
    Worker->>Gemini: generateExecutiveSummary(promptContext)
    Gemini-->>Worker: Generated Executive Summary & Title
    Worker->>DB: INSERT INTO digests (status: READY)
    Worker->>DB: INSERT INTO notifications (type: AI_DIGEST)
    Worker-->>Queue: Complete Job
```

---

## 4. Cross-Organization Resource Sharing Handshake

```mermaid
sequenceDiagram
    autonumber
    actor AdminOrgA as Org A Admin
    actor AdminOrgB as Org B Admin
    participant API as Express API
    participant CollabService as CollaborationService
    participant DB as PostgreSQL

    AdminOrgA->>API: POST /api/v1/connections (targetOrgId)
    API->>CollabService: requestConnection(sourceOrgId, targetOrgId)
    CollabService->>DB: INSERT INTO organization_connections (status: PENDING)

    AdminOrgB->>API: PATCH /api/v1/connections/:id/accept
    API->>CollabService: acceptConnection(connectionId)
    CollabService->>DB: UPDATE organization_connections (status: ACCEPTED)

    AdminOrgA->>API: POST /api/v1/sharing (resourceType: TICKET, permission: READ)
    API->>CollabService: shareResource(...)
    CollabService->>DB: INSERT INTO shared_resources
    CollabService-->>AdminOrgA: Resource Shared Successfully
```
