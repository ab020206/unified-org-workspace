# Diagram 12 — Pull Request Code Review Workflow

This sequence diagram depicts the pull request code review workflow state machine (`DRAFT` -> `UNDER_REVIEW` -> `CHANGES_REQUESTED` / `APPROVED` -> `MERGED`).

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Developer Creates Pull Request Draft
    DRAFT --> UNDER_REVIEW: Marked Ready for Review & Reviewers Assigned

    UNDER_REVIEW --> CHANGES_REQUESTED: Reviewer Submits CHANGES_REQUESTED Decision
    UNDER_REVIEW --> APPROVED: Required Approvals Met (Reviewer approves)
    UNDER_REVIEW --> REJECTED: Reviewer Rejects Pull Request

    CHANGES_REQUESTED --> UNDER_REVIEW: Developer pushes new commits / versions
    APPROVED --> MERGED: Admin / Reviewer executes PR Merge

    REJECTED --> [*]
    MERGED --> [*]
```
