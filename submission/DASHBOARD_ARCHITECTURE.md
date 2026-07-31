# Dashboard Architecture Specification

This document details the role-based dashboard architecture, component layout, persona navigation, data flow, widgets, and API usage across the 6 specialized dashboard views in the **Unified Organization Workspace**.

---

## 📊 1. Overview & Dashboard Routing Logic

The application implements a dynamic, role-driven presentation layer. Upon mounting the main dashboard page (`app/(dashboard)/dashboard/page.tsx`), the active user's role is inspected and automatically routes the rendering tree to one of 6 specialized persona dashboard components located in `components/dashboards/`.

```
                      ┌───────────────────────────┐
                      │ app/(dashboard)/dashboard │
                      └─────────────┬─────────────┘
                                    │ Inspect activeRole from AuthContext
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
    SUPER_ADMIN / Platform?       ADMIN?             SUPPORT_AGENT?
             │                      │                      │
  ┌──────────▼──────────┐ ┌─────────▼─────────┐ ┌──────────▼──────────┐
  │ SuperAdminDashboard │ │ OrgAdminDashboard │ │SupportAgentDashboard│
  └─────────────────────┘ └───────────────────┘ └─────────────────────┘
             │                      │                      │
         REVIEWER?               GUEST?                 AUDITOR?
             │                      │                      │
  ┌──────────▼──────────┐ ┌─────────▼─────────┐ ┌──────────▼──────────┐
  │  ReviewerDashboard  │ │  GuestDashboard   │ │  AuditorDashboard   │
  └─────────────────────┘ └───────────────────┘ └─────────────────────┘
```

---

## 🎭 2. Detailed Persona Dashboard Specifications

### 👑 1. Platform Super Admin Dashboard (`SuperAdminDashboard.tsx`)
- **Target Persona**: Global Platform Administrator (`isPlatformUser === true`).
- **Core Purpose**: System-wide oversight, multi-tenant organization provisioning, global telemetry, platform revenue metrics, cross-tenant security anomalies.
- **Key Widgets & Metrics**:
  - System Health Card (Database Latency, Redis Connection, Worker status).
  - Platform Statistics Grid (Total Organizations, Total Users, Active Sessions, Total Storage).
  - Organization Provisioning Modal & Multi-Org Switcher.
  - Cross-Tenant Security Anomaly Feed (`AnomalyAlert`).
- **API Routes Consumed**: `GET /api/v1/platform/stats`, `POST /api/v1/organizations`, `GET /api/v1/platform/health`.

### 🏢 2. Organization Admin Dashboard (`OrgAdminDashboard.tsx`)
- **Target Persona**: Workspace Administrator (`Role.ADMIN`).
- **Core Purpose**: Tenant management, team onboarding, role assignment, ticket/PR volume tracking, feature flag management, and organization settings.
- **Key Widgets & Metrics**:
  - Active Members & Roles Summary Widget.
  - Workspace Ticket Priority Distribution & SLA Status.
  - Active Pull Requests & Pending Approvals Widget.
  - Member Onboarding & Invitation Modal.
- **API Routes Consumed**: `GET /api/v1/organizations/:id`, `GET /api/v1/tickets`, `GET /api/v1/pull-requests`, `POST /api/v1/invitations`.

### 🎧 3. Support Dashboard (`SupportAgentDashboard.tsx`)
- **Target Persona**: Customer Support Lead / Agent (`Role.SUPPORT_AGENT`).
- **Core Purpose**: Ticket resolution queue, priority escalation management, SLA countdown timers, ticket response editor.
- **Key Widgets & Metrics**:
  - Ticket Queue Filter Tabs (Unassigned, Mine, Open, High/Urgent Priority).
  - SLA Breach Warning Banners & Urgent Escalation Card.
  - Ticket Detail Drawer with Commenting & Status Transition Controls.
- **API Routes Consumed**: `GET /api/v1/tickets`, `PATCH /api/v1/tickets/:id`, `POST /api/v1/tickets/:id/comments`.

### 🔀 4. Reviewer Dashboard (`ReviewerDashboard.tsx`)
- **Target Persona**: Technical Lead / Code Reviewer (`Role.REVIEWER`).
- **Core Purpose**: GitHub pull request review management, diff viewer triggers, review decision submittals (Approve, Request Changes, Reject), merge readiness.
- **Key Widgets & Metrics**:
  - Pending Review Queue ("Assigned to Me", "Awaiting Approval").
  - PR Merge Readiness Meter (CI Status, Required Approvals count).
  - Review Decision Action Modal.
- **API Routes Consumed**: `GET /api/v1/pull-requests`, `POST /api/v1/pull-requests/:id/reviews`, `POST /api/v1/pull-requests/:id/merge`.

### 👁️ 5. Guest Dashboard (`GuestDashboard.tsx`)
- **Target Persona**: External Client / Guest Viewer (`Role.GUEST`).
- **Core Purpose**: Read-only inspection of explicitly shared cross-organization tickets and pull requests.
- **Key Widgets & Metrics**:
  - Shared Resources Received List (`SharedResource`).
  - Read-Only Ticket & PR Activity Timeline.
  - Access Expiration Countdown Badge.
- **API Routes Consumed**: `GET /api/v1/sharing/received`, `GET /api/v1/sharing/access-logs`.

### 🛡️ 6. Auditor Dashboard (`AuditorDashboard.tsx`)
- **Target Persona**: Compliance Officer / Security Auditor (`Role.AUDITOR`).
- **Core Purpose**: Immutable security audit trail analysis, compliance reporting, module activity breakdown, IP address inspection.
- **Key Widgets & Metrics**:
  - Audit Log Search & Filter Table (Actor, Action, Module, Date Range).
  - State Change Diff Inspector (Previous State vs. New State).
  - Audit Analytics Charts (Action Frequency, Sensitive Operations).
- **API Routes Consumed**: `GET /api/v1/audit`, `GET /api/v1/audit/analytics`.

---

## 🎨 3. Common Dashboard Shell & Navigation

All 6 persona views share standard navigation infrastructure:
- **Navbar**: Top header containing current organization badge, theme toggle (dark/light), notifications drawer trigger, and user profile menu.
- **Sidebar**: Left vertical navigation bar providing links to Dashboard, Tickets, Pull Requests, Members, Audit Logs, AI Digest, Security, and Settings. Navigation items are filtered dynamically based on current user permissions (`hasPermission()`).
- **OrgSwitcher**: Dropdown placed in the sidebar allowing instant workspace switching or switching to "Platform View" for Super Admins.
