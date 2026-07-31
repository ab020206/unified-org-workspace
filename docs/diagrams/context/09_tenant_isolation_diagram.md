# Diagram 09 — Tenant Isolation & Multi-Tenancy Boundary Diagram

This diagram shows multi-tenant database isolation boundaries, foreign key context filters, and cross-organization sharing bridge trust boundaries.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TB
    subgraph TenantA [" 🏢 Tenant Alpha Workspace Boundary (Acme Tech) "]
        MemberA["OrganizationMember A"]
        TicketA[("tickets (org_id: A)")]
        PRA[("pull_requests (org_id: A)")]
        AuditA[("audit_logs (org_id: A)")]
    end

    subgraph TenantB [" 🏢 Tenant Beta Workspace Boundary (Nova Health) "]
        MemberB["OrganizationMember B"]
        TicketB[("tickets (org_id: B)")]
        PRB[("pull_requests (org_id: B)")]
        AuditB[("audit_logs (org_id: B)")]
    end

    subgraph Bridge [" 🌉 Cross-Tenant Sharing Bridge "]
        Conn["OrganizationConnection<br/>(status: ACCEPTED)"]
        Share["SharedResource<br/>(permission: READ)"]
    end

    MemberA -->|Direct Access| TicketA
    MemberA -->|Direct Access| PRA
    MemberB -->|Direct Access| TicketB
    MemberB -->|Direct Access| PRB

    TicketA -.->|Explicit Share| Share
    Share -.->|Granted Cross-Org Read| MemberB

    style TenantA fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style TenantB fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff
    style Bridge fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff
```

---

## 📄 Raw PlantUML Source File

Source file available at [`./09_tenant_isolation.puml`](./09_tenant_isolation.puml).
