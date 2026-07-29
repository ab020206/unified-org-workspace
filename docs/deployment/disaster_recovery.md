# Disaster Recovery & Operational Procedures

Emergency procedures for database restore, credential rotation, service recovery, and rollback operations.

---

## 1. Database Backup & Restoration

### Automated Backup

Run automated timestamped backup:

```bash
./scripts/backup-db.sh
```

Backups are saved to `./backups/workspace_db_YYYYMMDD_HHMMSS.sql.gz`.

### Restoration Procedure

To restore a backup file to PostgreSQL:

```bash
./scripts/restore-db.sh ./backups/workspace_db_20260728_120000.sql.gz
```

---

## 2. Secret & Credential Rotation Procedure

If `JWT_SECRET`, `DATABASE_URL`, or `REDIS_URL` credentials are compromised:

1. Generate new 32+ character random secrets:
   ```bash
   openssl rand -hex 32
   ```
2. Update environment secrets in `.env.production`.
3. Restart server and background worker containers:
   ```bash
   docker compose -f docker-compose.prod.yml restart server worker
   ```
4. Revoke active sessions via Security Console (`/security`).

---

## 3. Worker Recovery & Queue Crash Remediation

If Redis or BullMQ background workers crash:

1. Restart Redis container:
   ```bash
   docker compose -f docker-compose.prod.yml restart redis
   ```
2. Restart Worker process:
   ```bash
   docker compose -f docker-compose.prod.yml restart worker
   ```
3. BullMQ automatically resumes pending jobs without data loss.

---

## 4. Rollback Procedure

To roll back to a previous container release:

```bash
git checkout <previous-release-tag>
docker compose -f docker-compose.prod.yml up -d --build
```
