# Diagram 05 — Identity & Organization Service Deep Dive

This diagram illustrates the internals of `AuthService` and `OrganizationService`, including tenant context resolution, session database storage, member repositories, and permission resolution.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TD
    subgraph Client [" 💻 Client Layer "]
        Req["HTTP Request<br/>(Header: x-organization-id)"]
    end

    subgraph IdentityService [" 🔐 Identity & Auth Subsystem "]
        AuthSvc["AuthService"]
        TokenRepo["TokenRepository"]
        SessionRepo["SessionRepository"]
        UserRepo["UserRepository"]
    end

    subgraph OrgService [" 🏢 Organization Subsystem "]
        TenantMW["tenantContext Middleware"]
        OrgSvc["OrganizationService"]
        MemberRepo["MemberRepository"]
        PermSvc["PermissionService"]
    end

    subgraph DB [" 🗄️ PostgreSQL Database "]
        UserTable[("users")]
        SessionTable[("sessions")]
        TokenTable[("refresh_tokens")]
        OrgTable[("organizations")]
        MemberTable[("organization_members")]
        OverrideTable[("permission_overrides")]
    end

    Req -->|Bearer Token| AuthSvc
    AuthSvc -->|Verify Session| SessionRepo
    SessionRepo --> SessionTable
    AuthSvc -->|Validate User| UserRepo
    UserRepo --> UserTable

    Req -->|Header / Cookie| TenantMW
    TenantMW -->|Verify Active Member| MemberRepo
    MemberRepo --> MemberTable
    TenantMW -->|Fetch Org Profile| OrgSvc
    OrgSvc --> OrgTable

    TenantMW -->|Resolve Permissions| PermSvc
    PermSvc -->|Check Role & Overrides| OverrideTable

    style IdentityService fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style OrgService fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
```
