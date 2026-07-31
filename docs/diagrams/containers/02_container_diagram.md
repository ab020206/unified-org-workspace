# Diagram 02 — Container Topology Diagram

This diagram shows the container-level architecture of the **Unified Organization Workspace**, highlighting responsibilities, data flow, protocols, and boundaries across containers.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TD
    subgraph Browser [" 🌐 Browser Client "]
        UI["React 19 Presentation Layer<br/>(App Router, AuthContext, React Query)"]
    end

    subgraph API_Container [" ⚙️ API Application Container "]
        Middleware["Middleware Chain<br/>(Auth, TenantContext, RBAC)"]
        Controllers["Controllers Layer<br/>(Auth, Org, Ticket, PR, Audit)"]
        Services["Services Layer<br/>(AuthService, OrgService, etc.)"]
        Prisma["Prisma ORM Client"]
    end

    subgraph Datastores [" 🗄️ Datastores Container "]
        PostgreSQL[("PostgreSQL / Neon Database<br/>(21 Prisma Models)")]
        Redis[("Redis / Upstash<br/>(Sessions & Rate Limits)")]
    end

    subgraph Background [" ⚡ Background Worker Container "]
        Queue["DigestQueue Engine"]
        Worker["digest.worker.ts Worker Process"]
    end

    UI -->|HTTP POST/GET/PATCH/DELETE| Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma -->|SQL / Port 5432| PostgreSQL
    Services -->|ioredis / Port 6379| Redis
    Services -->|Enqueue Job| Queue
    Queue --> Worker
    Worker -->|Fetch Data & Save Digest| Prisma

    style Browser fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style API_Container fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Datastores fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style Background fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
```

---

## 📄 Raw Structurizr Source File

Source file available at [`./02_container_diagram.c4`](./02_container_diagram.c4).
