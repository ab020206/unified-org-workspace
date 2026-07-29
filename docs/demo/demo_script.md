# Demo Video Walkthrough Script

Structured 10-step video demonstration script for evaluating the **Unified Organization Workspace**.

---

## Recommended Demo Recording Flow (5–7 Minutes)

1. **Introduction & System Overview (30s)**:
   - Introduce the platform as a multi-tenant enterprise workspace platform.
   - Highlight the tech stack: Next.js 15, Express.js, Prisma ORM, PostgreSQL, Redis, and Gemini AI.

2. **Authentication & Multi-Tenant Organization Switcher (45s)**:
   - Show user registration (`/register`) and initial workspace auto-creation.
   - Show organization switcher in Navbar and switching between Org Alpha & Org Beta.

3. **RBAC & Dynamic Permission Enforcement (45s)**:
   - Demonstrate Admin role vs Guest role UI navigation filtering in the Sidebar.
   - Attempting restricted actions shows `403 Forbidden` modal/banner.

4. **Support Hub (Ticket Management) (45s)**:
   - Create support ticket (`/tickets/new`), filter by priority/status, upload attachment, add comment, and view activity timeline.

5. **Review Console (Code PRs & Review Workflow) (45s)**:
   - Create Pull Request (`/pull-requests/new`), assign reviewers, upload new version, submit approval decision, and execute merge.

6. **Unified Audit Console (Immutability & Delta Tracking) (45s)**:
   - Navigate to `/audit`, search for recent action `PR_MERGED`, expand JSON state delta viewer showing `previousState` vs `newState`.

7. **Cross-Organization Collaboration & Sharing (45s)**:
   - Send connection request from Org Alpha to Org Beta (`/collaboration`), accept handshake, and share ticket with `READ` permission.

8. **✨ AI Executive Digest & Real-time Notifications (45s)**:
   - Trigger background AI digest generation (`/digest`), observe BullMQ background job processing, view generated executive summary, and check unread notification badge in Navbar.

9. **Security Console & Feature Flag Board (45s)**:
   - Open `/security`, view active sessions, revoke session, inspect system health metrics (Postgres latency, Redis status), and toggle `AI_DIGEST` feature flag live.

10. **Conclusion & Deployment Overview (30s)**:
    - Highlight automated CI/CD pipeline, Docker containerization (`docker-compose.prod.yml`), master test suite execution (73 passing tests), and wrap up.
