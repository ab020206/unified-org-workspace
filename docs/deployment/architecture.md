# Production Deployment Architecture

Production SaaS topology specification for the **Unified Organization Workspace** platform.

---

## Topology Diagram

```text
                               Users
                                 │
                                 ▼
                     Nginx Reverse Proxy (Port 80/443)
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
      Next.js Frontend (3000)         Express Backend API (4000)
                                                 │
                                 ┌───────────────┼───────────────┐
                                 ▼               ▼               ▼
                           PostgreSQL (5432)  Redis (6379)  BullMQ Worker
                                                                 │
                                                                 ▼
                                                             Gemini AI
```

---

## Service Responsibilities & Scaling Strategy

| Service               | Scale Type     | Technology            | Port     | Scaling / Recovery Policy                                                |
| :-------------------- | :------------- | :-------------------- | :------- | :----------------------------------------------------------------------- |
| **Reverse Proxy**     | Stateless      | Nginx 1.25 Alpine     | 80 / 443 | Rate limits requests, handles SSL termination & static gzip compression. |
| **Frontend**          | Stateless      | Next.js 15 App Router | 3000     | Horizontally scalable across container clusters.                         |
| **Backend API**       | Stateless      | Express.js / Node 20  | 4000     | Horizontally scalable. Connects to central Postgres & Redis.             |
| **Background Worker** | Stateful Queue | Node 20 / BullMQ      | N/A      | Scales independently based on queue backlog. Recovers crash states.      |
| **Database**          | Stateful Core  | PostgreSQL 16 Alpine  | 5432     | Primary database with point-in-time automated backups.                   |
| **Cache & Queue**     | Stateful Cache | Redis 7 Alpine        | 6379     | In-memory session store & queue coordinator.                             |

---

## Zero-Downtime Deployment Flow

```text
Git Release Push → CI Automated Tests → Docker Image Build → Container Health Check → Reverse Proxy Switch -> Zero Downtime
```
