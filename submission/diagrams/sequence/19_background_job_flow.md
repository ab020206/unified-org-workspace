# Diagram 19 — Background Job Execution Flow Diagram

This sequence diagram details the asynchronous queueing, worker consumption, Gemini AI completion call, database digest persistence, notification creation, and job history recording flow.

---

## 🎨 Visual Diagram (Mermaid Render)

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as Digest Controller
    participant Queue as DigestQueue Engine
    participant Worker as digest.worker.ts
    participant AI as aiService (Gemini / Mock)
    participant DB as PostgreSQL DB

    User->>API: POST /api/v1/digest/generate
    API->>Queue: add("GENERATE_DIGEST", { userId, orgId })
    Queue-->>API: Return Job ID (job-12345)
    API-->>User: HTTP 202 Accepted ("Digest generation queued")

    Queue->>Worker: Trigger processDigestJob(job)
    Worker->>DB: Fetch active user tickets, PRs, and shared resources
    DB-->>Worker: Activity Payload (tickets, PRs, shares)

    Worker->>Worker: Formulate prompt via PromptManager.buildDigestPrompt()
    Worker->>AI: generateCompletion(prompt)
    AI-->>Worker: Completion Result (summary text, model, token usage)

    Worker->>DB: INSERT INTO digests (summary, status: READY)
    Worker->>DB: INSERT INTO notifications (type: AI_DIGEST, referenceId)
    Worker->>DB: INSERT INTO job_histories (status: COMPLETED)
    Worker-->>Queue: Mark Job Finished
```
