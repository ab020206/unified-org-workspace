# Diagram 04 — Frontend Component Diagram

This diagram shows the React / Next.js presentation layer component hierarchy, client context state, and navigation wrappers.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TD
    subgraph RootLayout [" 🖼️ app/layout.tsx & app/(dashboard)/layout.tsx "]
        AuthProvider["AuthProvider (React Context)"]
        QueryProvider["QueryClientProvider (React Query)"]
    end

    subgraph Navigation [" 🧭 Global Navigation Shell "]
        Navbar["Navbar Component<br/>(User Menu, ThemeToggle, Notifications)"]
        Sidebar["Sidebar Component<br/>(Permission-based Navigation Links)"]
        OrgSwitcher["OrgSwitcher Component<br/>(Recent Orgs, Search, Switcher Modal)"]
    end

    subgraph Dashboards [" 🎭 Persona Dashboard Views "]
        SuperAdmin["SuperAdminDashboard.tsx"]
        OrgAdmin["OrgAdminDashboard.tsx"]
        Support["SupportAgentDashboard.tsx"]
        Reviewer["ReviewerDashboard.tsx"]
        Guest["GuestDashboard.tsx"]
        Auditor["AuditorDashboard.tsx"]
    end

    AuthProvider --> Navigation
    QueryProvider --> Navigation
    Sidebar --> OrgSwitcher
    Navigation -->|Renders Active Persona View| Dashboards

    style RootLayout fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Navigation fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style Dashboards fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
```

---

## 📄 Raw PlantUML Source File

Source file available at [`./04_frontend_component.puml`](./04_frontend_component.puml).
