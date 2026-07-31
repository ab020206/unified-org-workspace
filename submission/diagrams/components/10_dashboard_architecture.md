# Diagram 10 — Dashboard Component & Layout Architecture

This diagram shows component composition, widget data binding, layout wrappers, and API route mappings for the 6 persona dashboards.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TD
    DashboardPage["app/(dashboard)/dashboard/page.tsx"] --> Router{Inspect User activeRole}

    Router -->|SUPER_ADMIN / Platform| SuperAdmin["SuperAdminDashboard.tsx"]
    Router -->|ADMIN| OrgAdmin["OrgAdminDashboard.tsx"]
    Router -->|SUPPORT_AGENT| Support["SupportAgentDashboard.tsx"]
    Router -->|REVIEWER| Reviewer["ReviewerDashboard.tsx"]
    Router -->|GUEST| Guest["GuestDashboard.tsx"]
    Router -->|AUDITOR| Auditor["AuditorDashboard.tsx"]

    SuperAdmin -->|Fetch Telemetry| ApiPlatform["GET /api/v1/platform/stats"]
    OrgAdmin -->|Fetch Members & Overview| ApiOrg["GET /api/v1/organizations/:id"]
    Support -->|Fetch Ticket Queue| ApiTickets["GET /api/v1/tickets"]
    Reviewer -->|Fetch PR Queue| ApiPRs["GET /api/v1/pull-requests"]
    Guest -->|Fetch Shared Items| ApiShares["GET /api/v1/sharing/received"]
    Auditor -->|Fetch Security Audits| ApiAudit["GET /api/v1/audit"]

    style DashboardPage fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
```
