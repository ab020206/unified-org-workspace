# Diagram 13 — Security Audit Logging Pipeline

This diagram shows how audit events are captured, enriched with HTTP metadata (IP address, User-Agent, Request ID), processed by `AuditService`, and persisted to `AuditLog` and `AuditMetadata` tables.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TD
    subgraph Trigger [" 🎬 Action Trigger "]
        Action["Controller Action Executed<br/>(e.g., LOGIN, REGISTER, UPDATE_ROLE)"]
    end

    subgraph Metadata [" 🌐 HTTP Context Extraction "]
        ReqID["x-request-id UUID"]
        IP["Client IP Address"]
        UA["User-Agent Header"]
        StateDiff["previousState vs newState JSON"]
    end

    subgraph Service [" 🧠 Audit Processing Service "]
        AuditSvc["AuditService.log()"]
    end

    subgraph Database [" 🗄️ PostgreSQL Database "]
        AuditTable[("AuditLog Record<br/>(actorId, module, action)")]
        MetaTable[("AuditMetadata Record<br/>(key-value pairs)")]
    end

    Action --> AuditSvc
    ReqID --> AuditSvc
    IP --> AuditSvc
    UA --> AuditSvc
    StateDiff --> AuditSvc

    AuditSvc -->|INSERT INTO audit_logs| AuditTable
    AuditSvc -->|INSERT INTO audit_metadata| MetaTable

    style Trigger fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style Service fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Database fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
```
