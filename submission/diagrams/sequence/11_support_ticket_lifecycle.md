# Diagram 11 — Support Ticket Lifecycle & State Machine

This sequence diagram depicts the support ticket lifecycle state transitions (`OPEN` -> `IN_PROGRESS` -> `WAITING_FOR_RESPONSE` -> `RESOLVED` -> `CLOSED` / `REOPENED`), commenting, activity auditing, and assignment.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
stateDiagram-v2
    [*] --> OPEN: Ticket Created by User / Admin

    OPEN --> IN_PROGRESS: Support Agent Assigned & Starts Investigation
    OPEN --> WAITING_FOR_RESPONSE: Agent requests clarifying details from Customer

    WAITING_FOR_RESPONSE --> IN_PROGRESS: User provides comment / details
    IN_PROGRESS --> RESOLVED: Agent posts resolution fix & marks Resolved

    RESOLVED --> CLOSED: System / Admin closes ticket after 7 days
    RESOLVED --> REOPENED: User reports issue persists & reopens ticket

    REOPENED --> IN_PROGRESS: Agent resumes investigation
    CLOSED --> [*]
```
