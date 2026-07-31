# Architecture Diagram Exports & Reviewer Editing Guide

This directory contains editable raw source files (`.c4`, `.puml`, `.d2`) and embedded Markdown rendering documentation for all 20 system architecture diagrams of the **Unified Organization Workspace**.

---

## 🛠️ Diagram Technologies & Tools Guide

### 1. Structurizr DSL (`.c4` / `.dsl`)
- **Best Used For**: C4 System Context and C4 Container diagrams.
- **How to Edit**: Open `.c4` source files in any text editor.
- **How to View & Export**:
  1. Go to [Structurizr Express](https://structurizr.com/express) or use the local CLI tool (`structurizr-cli`).
  2. Paste the contents of `01_system_context.c4` or `02_container_diagram.c4`.
  3. Export to PNG, SVG, or Interactive Web Viewer.

### 2. PlantUML (`.puml`)
- **Best Used For**: Component topology, Database ERDs, Sequence flows, Deployment architecture.
- **How to Edit**: Edit `.puml` files using VS Code with the "PlantUML" extension or IntelliJ IDEA.
- **How to Export PNG / SVG**:
  - **VS Code**: Press `Alt + D` to preview, right-click -> `Export Current Diagram` -> select `PNG` or `SVG`.
  - **Command Line**: `plantuml -tsvg filename.puml` or `plantuml -tpng filename.puml`.
  - **Online Server**: Copy content into [PlantUML Web Server](www.plantuml.com/plantuml/uml/).

### 3. Mermaid (`.md` embedded)
- **Best Used For**: Instant Markdown visual rendering in GitHub, GitLab, VS Code, and IDE previewers.
- **How to View**: Open any `.md` file in `submission/diagrams/` — GitHub renders Mermaid blocks natively.
- **How to Export PNG / SVG**: Use the Mermaid CLI (`npx @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.png`).

---

## 📁 Diagram Source File Directory Map

| # | Diagram Name | Category | Editable Source File | Markdown Embed Document |
| :- | :--- | :--- | :--- | :--- |
| 1 | System Context | `context` | `01_system_context.c4` | [01_system_context.md](../context/01_system_context.md) |
| 2 | Container Topology | `containers` | `02_container_diagram.c4` | [02_container_diagram.md](../containers/02_container_diagram.md) |
| 3 | Backend Component | `components` | `03_backend_component.puml` | [03_backend_component.md](../components/03_backend_component.md) |
| 4 | Frontend Component | `components` | `04_frontend_component.puml` | [04_frontend_component.md](../components/04_frontend_component.md) |
| 5 | Identity & Org Service | `components` | — | [05_identity_org_service.md](../components/05_identity_org_service.md) |
| 6 | Authentication Sequence | `sequence` | — | [06_authentication_sequence.md](../sequence/06_authentication_sequence.md) |
| 7 | Org Switching Sequence | `sequence` | — | [07_organization_switching_sequence.md](../sequence/07_organization_switching_sequence.md) |
| 8 | RBAC Decision Flow | `components` | — | [08_rbac_decision_flow.md](../components/08_rbac_decision_flow.md) |
| 9 | Tenant Isolation | `context` | `09_tenant_isolation.puml` | [09_tenant_isolation_diagram.md](../context/09_tenant_isolation_diagram.md) |
| 10 | Dashboard Architecture | `components` | — | [10_dashboard_architecture.md](../components/10_dashboard_architecture.md) |
| 11 | Ticket Lifecycle | `sequence` | — | [11_support_ticket_lifecycle.md](../sequence/11_support_ticket_lifecycle.md) |
| 12 | Review Workflow | `sequence` | — | [12_review_workflow.md](../sequence/12_review_workflow.md) |
| 13 | Audit Logging Pipeline | `components` | — | [13_audit_logging_pipeline.md](../components/13_audit_logging_pipeline.md) |
| 14 | Notification Pipeline | `components` | — | [14_notification_pipeline.md](../components/14_notification_pipeline.md) |
| 15 | Database ERD | `database` | `15_database_er_diagram.puml`| [15_database_er_diagram.md](../database/15_database_er_diagram.md) |
| 16 | Deployment Topology | `deployment` | `16_deployment.puml` | [16_deployment_diagram.md](../deployment/16_deployment_diagram.md) |
| 17 | Request Lifecycle | `sequence` | — | [17_request_lifecycle.md](../sequence/17_request_lifecycle.md) |
| 18 | API Interaction | `components` | — | [18_api_interaction_diagram.md](../components/18_api_interaction_diagram.md) |
| 19 | Background Job Flow | `sequence` | — | [19_background_job_flow.md](../sequence/19_background_job_flow.md) |
| 20 | Complete Data Flow | `components` | — | [20_complete_data_flow_diagram.md](../components/20_complete_data_flow_diagram.md) |
