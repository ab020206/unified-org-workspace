# Diagram 16 — Physical & Containerized Deployment Diagram

This diagram shows physical server nodes, Vercel / Render cloud infrastructure, Docker container runtime setups, and cloud datastores.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TB
    subgraph Client [" 💻 Client Devices "]
        Browser["User Web Browser"]
    end

    subgraph HostingPlatform [" ☁️ Render / Vercel Cloud Platform "]
        AppPod["Next.js App Server Pod<br/>(Node.js 20 Container)"]
        WorkerPod["Background Worker Pod<br/>(npm run worker)"]
    end

    subgraph ManagedDB [" 🗄️ Neon Database Cloud "]
        Postgres[("PostgreSQL Serverless DB<br/>(Connection Pooling)")]
    end

    subgraph ManagedCache [" ⚡ Upstash Redis Cloud "]
        Redis[("Managed Redis Store")]
    end

    subgraph ExternalAPIs [" 🌐 External API Cloud "]
        Gemini["Google Gemini AI"]
        GitHub["GitHub Webhooks"]
    end

    Browser -->|HTTPS TLS 1.3| AppPod
    AppPod -->|SSL / Port 5432| Postgres
    AppPod -->|TLS / Port 6379| Redis
    AppPod -->|Enqueue Job| WorkerPod
    WorkerPod -->|REST API| Gemini
    AppPod <-->|Webhooks| GitHub

    style HostingPlatform fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style ManagedDB fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style ManagedCache fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
```

---

## 📄 Raw PlantUML Source File

Source file available at [`./16_deployment.puml`](./16_deployment.puml).
