# Reviewer Demo Guide & Pre-Seeded Persona Walkthroughs

This document provides reviewers with pre-seeded demo user credentials, role profiles, and step-by-step evaluation scenarios to experience all 6 persona views and enterprise features of the **Unified Organization Workspace**.

---

## 🔑 1. Global Pre-Seeded Demo Credentials

All pre-seeded demo accounts share a single unified demo password:

> **Universal Password**: `Demo@12345`

---

## 👥 2. Pre-Seeded Persona Accounts Directory

| Role / Persona Title | Email Address | Pre-Seeded Organization(s) | Primary Recommended Evaluation Focus |
| :--- | :--- | :--- | :--- |
| **Platform Super Admin** | `superadmin@platform.demo` | Platform View (All Orgs: Acme, Nova, Zenith) | Global Telemetry, Provisioning, Cross-Org Switching |
| **Multi-Org Exec (John)**| `john@demo.com` | Acme Technologies (Admin) + Zenith Logistics (Reviewer) | Seamless Org Switching between Acme & Zenith |
| **Multi-Org Support (Sarah)**| `sarah@demo.com` | Acme Technologies (Support) + Nova Healthcare (Support) | Multi-tenant Support Ticket Queue Management |
| **Acme Admin** | `admin@acme.demo` | Acme Technologies (Admin) | Member Invites, Role Updates, Org Settings |
| **Acme Support Lead** | `support1@acme.demo` | Acme Technologies (Support Agent) | SLA Management, Ticket Escalations, Commenting |
| **Acme Code Reviewer** | `reviewer@acme.demo` | Acme Technologies (Reviewer) | PR Reviews, Approvals, Merge Readiness |
| **Nova Guest Viewer** | `guest@nova.demo` | Nova Healthcare (Guest Viewer) | Shared Cross-Org Tickets & Read-Only Access |
| **Acme Auditor** | `auditor@acme.demo` | Acme Technologies (Auditor) | Security Audit Logs, Diffs, Audit Analytics |

---

## 🎭 3. Step-by-Step Scenario Walkthroughs

### Scenario 1: Multi-Tenant Workspace Switching & Platform View
1. Log in as `superadmin@platform.demo` with password `Demo@12345`.
2. Observe the **Platform Super Admin Dashboard** showing global platform stats across all organizations.
3. Click on the **OrgSwitcher** dropdown in the top-left sidebar.
4. Select `Acme Technologies` — notice the UI context seamlessly re-hydrates to display Acme's specific tickets, PRs, and metrics.
5. Click **OrgSwitcher** again and select `Platform View` to return to global administrative mode.

### Scenario 2: Support Ticket Lifecycle & Agent Escalation
1. Log in as `support1@acme.demo` (Acme Support Lead).
2. Observe the **Support Agent Dashboard** showing active tickets categorized by priority (`URGENT`, `HIGH`, `MEDIUM`).
3. Click on an `OPEN` ticket to open the Detail Drawer.
4. Add a response message in the comment editor and click **Update Status to IN_PROGRESS**.
5. Observe the SLA timer and status badge updating dynamically.

### Scenario 3: Code Review, PR Approvals & Merge Flow
1. Log in as `reviewer@acme.demo` (Acme Code Reviewer).
2. Observe the **Reviewer Dashboard** listing active Pull Requests awaiting code review.
3. Select a Pull Request to view details, CI check status, and reviewer assignments.
4. Click **Submit Review** -> Select `APPROVED` -> Submit.
5. Notice the PR status transitioning to `APPROVED` and enabling the **Merge PR** button.

### Scenario 4: AI Activity Digest Generation
1. Log in as `admin@acme.demo` (Acme Admin).
2. Navigate to `/digest` in the sidebar.
3. Click **Generate AI Digest Briefing**.
4. Observe the non-blocking toast notification while the background worker processes active tickets, PRs, and shares.
5. View the generated Markdown AI briefing summary and check the top navbar for the new notification bell badge.

### Scenario 5: Security Audit Trail & Compliance Inspection
1. Log in as `auditor@acme.demo` (Acme Auditor).
2. Observe the **Auditor Dashboard** showing real-time security audit events.
3. Filter logs by module `AUTHENTICATION` or action `LOGIN`.
4. Click on an audit row to inspect the `previousState` vs. `newState` JSON diff along with actor IP and User-Agent signature.
