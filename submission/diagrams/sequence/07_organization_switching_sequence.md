# Diagram 07 — Organization Switching Sequence Diagram

This sequence diagram illustrates client-side organization selection, cookie setting, header injection, server-side membership verification, and context re-hydration.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
sequenceDiagram
    autonumber
    actor User as User UI
    participant OrgSwitcher as OrgSwitcher.tsx
    participant AuthContext as AuthContext.tsx
    participant API as API Server (tenantContext MW)
    participant MemberRepo as MemberRepository
    participant DB as PostgreSQL DB

    User->>OrgSwitcher: Select "Nova Healthcare" from Dropdown
    OrgSwitcher->>AuthContext: switchOrganization("org-nova-id")
    AuthContext->>AuthContext: Set active_org_id Cookie & update State
    AuthContext->>AuthContext: invalidateQueries() (Clear React Query cache)

    AuthContext->>API: GET /api/v1/auth/me (Header: x-organization-id = "org-nova-id")
    API->>API: Extract x-organization-id header
    API->>MemberRepo: findMembership("org-nova-id", userId)
    MemberRepo->>DB: SELECT * FROM organization_members WHERE organization_id = ? AND user_id = ?
    
    alt Active Member Found
        DB-->>MemberRepo: Member Record (role: ADMIN)
        MemberRepo-->>API: Active Membership
        API->>API: Attach req.organization & req.membership
        API-->>AuthContext: HTTP 200 OK (Org Details & User Role)
        AuthContext-->>OrgSwitcher: Update Active Org UI & Toast Notification
    else Membership Missing or Inactive
        DB-->>MemberRepo: null / inactive
        API-->>AuthContext: HTTP 403 Forbidden ("User does not have an active membership")
        AuthContext-->>OrgSwitcher: Show Error Toast Notification
    end
```
