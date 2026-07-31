# Diagram 20 — End-to-End Complete System Data Flow Diagram

This diagram visualizes the end-to-end data trajectory across the entire platform, connecting user actions, presentation state, API middleware, services, data persistence, worker background jobs, AI services, and security logging.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TB
    subgraph Layer1 [" 🌐 Presentation Layer "]
        ClientUI["React 19 Frontend App<br/>(App Router, AuthContext, OrgSwitcher)"]
    end

    subgraph Layer2 [" 🛡️ Security & API Pipeline "]
        RateLimit["Rate Limiter & Sanitizer"]
        AuthMW["Authentication Middleware<br/>(JWT & DB Session Check)"]
        TenantMW["Tenant Context Injection<br/>(x-organization-id)"]
        RBACMW["RBAC & Override Resolver"]
    end

    subgraph Layer3 [" 🧠 Domain Services "]
        AuthService["AuthService"]
        OrgService["OrganizationService"]
        TicketService["TicketService"]
        PRService["PullRequestService"]
        AuditService["AuditService"]
    end

    subgraph Layer4 [" 🗄️ Persistence & Infrastructure "]
        Postgres[("PostgreSQL Database<br/>(21 Prisma Models)")]
        RedisStore[("Redis Session & Counter Store")]
    end

    subgraph Layer5 [" ⚡ Async Workers & AI Cloud "]
        DigestQueue["DigestQueue Engine"]
        WorkerProcess["digest.worker.ts Engine"]
        GeminiAI["Google Gemini AI API"]
    end

    ClientUI -->|HTTP Request| RateLimit
    RateLimit --> AuthMW
    AuthMW --> TenantMW
    TenantMW --> RBACMW

    RBACMW --> AuthService
    RBACMW --> OrgService
    RBACMW --> TicketService
    RBACMW --> PRService

    AuthService --> AuditService
    OrgService --> AuditService
    TicketService --> AuditService
    PRService --> AuditService

    AuthService --> Postgres
    OrgService --> Postgres
    TicketService --> Postgres
    PRService --> Postgres
    AuditService --> Postgres

    AuthService --> RedisStore
    TicketService --> DigestQueue
    DigestQueue --> WorkerProcess
    WorkerProcess --> GeminiAI
    WorkerProcess --> Postgres

    style Layer1 fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style Layer2 fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Layer3 fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style Layer4 fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#fff
    style Layer5 fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
```
