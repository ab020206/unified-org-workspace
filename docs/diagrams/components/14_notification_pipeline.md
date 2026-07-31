# Diagram 14 — Multi-Channel Notification Pipeline

This diagram illustrates how notification events (`AI_DIGEST`, `TICKET_ASSIGNED`, `REVIEW_ASSIGNED`, `SHARE_RECEIVED`) are evaluated against user preferences and dispatched to in-app notification stores.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
graph TD
    SystemEvent["System / Service Event Trigger"] --> PrefCheck{"Check NotificationPreference<br/>(emailInstantEvents, pushEnabled)"}

    PrefCheck -->|In-App Store| NotifRepo["NotificationRepository.createNotification()"]
    NotifRepo -->|INSERT| NotifDB[("Notification Table<br/>(isRead: false)")]

    PrefCheck -->|Email Digest Enabled| DigestQueue["Enqueue Email Digest Job"]
    PrefCheck -->|Push Enabled| PushSvc["PushNotificationService<br/>(WebPush Payload)"]

    NotifDB -->|Real-time Query / Polling| UI["Navbar Bell Indicator & Toast Notification"]

    style SystemEvent fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#fff
    style NotifRepo fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
```
