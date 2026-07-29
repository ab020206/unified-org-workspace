# Docker Operations & Container Deployment Guide

Deployment instructions for running the **Unified Organization Workspace** via Docker & Docker Compose.

---

## Production Deployment Commands

### 1. Launch Full Stack with Production Docker Compose

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 2. Verify Service Health

```bash
docker compose -f docker-compose.prod.yml ps
```

Check endpoint responses:

```bash
curl http://localhost/health
curl http://localhost/live
curl http://localhost/ready
```

### 3. Service Container Overview

- `prod_workspace_proxy`: Reverse Proxy (Nginx on Port 80)
- `prod_workspace_client`: Frontend Application (Port 3000)
- `prod_workspace_server`: Backend API Engine (Port 4000)
- `prod_workspace_worker`: BullMQ Background Worker
- `prod_workspace_postgres`: PostgreSQL Database (Port 5432)
- `prod_workspace_redis`: Redis Cache & Queue Manager (Port 6379)

---

## Log Inspection

View container logs live:

```bash
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f worker
```
