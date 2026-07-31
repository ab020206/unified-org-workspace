# Diagram 08 — RBAC Decision Flow Diagram

This diagram details the decision tree executed during permission resolution, showing Super Admin global bypass checks, default role permission hydration, and DB-level `PermissionOverride` evaluation.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
flowchart TD
    Start([Incoming Request Require Permission]) --> CheckSuperAdmin{Is User Role == SUPER_ADMIN?}
    
    CheckSuperAdmin -- YES --> GrantAll[Grant Full Access<br/>Return All 25 Permissions]
    GrantAll --> Allow([Allow Controller Execution])

    CheckSuperAdmin -- NO --> HydrateDefaults[Hydrate DEFAULT_ROLE_PERMISSIONS<br/>Set per member role]
    HydrateDefaults --> FetchOverrides[Query DB: permission_overrides<br/>where member_id = req.member.id]

    FetchOverrides --> CheckOverrides{Has Member DB Overrides?}
    
    CheckOverrides -- NO --> EvaluateRequested{Is Requested Permission<br/>in Role Permissions Set?}
    
    CheckOverrides -- YES --> LoopOverrides[Iterate Overrides]
    LoopOverrides --> OverrideType{override.allowed == true?}
    
    OverrideType -- YES --> AddPerm[Set.add: override.permission]
    OverrideType -- NO --> RemovePerm[Set.delete: override.permission]
    
    AddPerm --> EvaluateRequested
    RemovePerm --> EvaluateRequested

    EvaluateRequested -- YES --> Allow
    EvaluateRequested -- NO --> Deny[Reject Request<br/>Return HTTP 403 Forbidden]
    Deny --> End([Halt Execution])

    style Start fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Allow fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
    style Deny fill:#881337,stroke:#f43f5e,stroke-width:2px,color:#fff
```
