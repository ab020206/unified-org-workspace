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

---

## GitHub Actions Docker CI/CD Pipeline

The repository includes an automated pipeline in [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) that automatically builds, packages, and deploys Docker images upon pushing to `main` or `master`.

### 1. Workflow Pipeline Stages

1. **🧪 Run Automated Test Suite**: Starts isolated Postgres & Redis service containers and executes all 73 integration, RBAC, and security tests.
2. **🐳 Build & Push Docker Images**: Uses Docker Buildx to compile production images for `server`, `client`, and `worker` and pushes them to **GitHub Container Registry (`ghcr.io`)**.
3. **🚀 Remote SSH Deployment**: Connects to your production server via SSH, logs into `ghcr.io`, pulls updated images, restarts containers using `docker-compose.prod.yml`, and applies Prisma database migrations.

### 2. GitHub Secrets Configuration

Configure the following secrets in GitHub Repository Settings (`Settings > Secrets and variables > Actions`):

| Secret Key | Description                               | Example                                   |
| :--------- | :---------------------------------------- | :---------------------------------------- |
| `SSH_HOST` | Remote server IP address or domain        | `203.0.113.195`                           |
| `SSH_USER` | SSH username on server                    | `ubuntu` or `root`                        |
| `SSH_KEY`  | Private SSH key for server authentication | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `SSH_PORT` | SSH port (Optional, default: 22)          | `22`                                      |

### 3. Server Setup for GitHub Actions Deployment

On your target deployment host:

1. Clone repository to `~/app`:

   ```bash
   mkdir -p ~/app && cd ~/app
   git clone <your-repo-url> .
   ```

2. Create production configuration `.env.production`:

   ```bash
   cp .env.example .env.production
   ```

3. Ensure user's public SSH key is added to `~/.ssh/authorized_keys`.
