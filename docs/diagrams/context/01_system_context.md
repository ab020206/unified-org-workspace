# Diagram 01 — System Context Diagram

This diagram depicts the high-level system context of the **Unified Organization Workspace** platform using the C4 Model, showing interactions between core personas, system boundaries, and external services.

> **Diagram Technology Rationale**: C4 Structurizr DSL is selected for System Context because it provides strict, standard enterprise abstraction boundaries (System vs. Person vs. External Service) without visual noise.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TB
    subgraph Users [" 👥 User Personas "]
        SuperAdmin["Platform Super Admin"]
        OrgAdmin["Organization Admin"]
        SupportAgent["Support Agent"]
        Reviewer["Code Reviewer"]
        Guest["Guest Viewer"]
        Auditor["Compliance Auditor"]
    end

    subgraph SystemBoundary [" 🛡️ System Boundary: Unified Organization Workspace "]
        WebApp["Web App & API Server<br/>(Next.js 15 + Express Sub-App)"]
        Database[("PostgreSQL / Neon DB<br/>(Prisma ORM - 21 Models)")]
        Cache[("Redis / Upstash<br/>(Sessions & Rate Limits)")]
        Worker["Async Digest Worker<br/>(DigestQueue Engine)"]
    end

    subgraph External [" ☁️ External Cloud Services "]
        Gemini["Google Gemini AI API<br/>(gemini-1.5-flash / Mock)"]
        GitHub["GitHub Integration API<br/>(PR Sync & Webhooks)"]
    end

    Users -->|HTTPS / REST / Auth Token| WebApp
    WebApp -->|Prisma Queries| Database
    WebApp -->|Cache Reads / Rate Limit| Cache
    WebApp -->|Enqueue Job| Worker
    Worker -->|Prompt Briefing| Gemini
    WebApp -->|REST & Webhooks| GitHub

    style SystemBoundary fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Users fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style External fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
```

---

## 📄 Raw Structurizr Source File

Reviewers can edit and export the raw C4 Structurizr DSL file located at [`./01_system_context.c4`](./01_system_context.c4).
