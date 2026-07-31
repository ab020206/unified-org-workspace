# Diagram 15 — Database Entity-Relationship (ER) Diagram

This diagram visualizes the complete entity relationships across the 21 Prisma database models and foreign key constraints.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
erDiagram
    User ||--o{ OrganizationMember : "has memberships"
    User ||--o{ Session : "has active sessions"
    User ||--o{ RefreshToken : "owns tokens"
    
    Organization ||--o{ OrganizationMember : "contains members"
    OrganizationMember ||--o{ PermissionOverride : "has overrides"

    Organization ||--o{ Ticket : "owns tickets"
    User ||--o{ Ticket : "creates tickets"
    Ticket ||--o{ TicketComment : "has comments"
    Ticket ||--o{ TicketAttachment : "has attachments"

    Organization ||--o{ PullRequest : "owns PRs"
    User ||--o{ PullRequest : "creates PRs"
    PullRequest ||--o{ PullRequestReviewer : "assigned reviewers"
    PullRequest ||--o{ ReviewDecision : "has review decisions"

    Organization ||--o{ AuditLog : "logs actions"
    User ||--o{ AuditLog : "triggers actions"
    AuditLog ||--o{ AuditMetadata : "contains metadata"

    Organization ||--o{ OrganizationConnection : "source / target"
    Organization ||--o{ SharedResource : "shares resources"
```

---

## 📄 Raw PlantUML Source File

Source file available at [`./15_database_er_diagram.puml`](./15_database_er_diagram.puml).
