#!/usr/bin/env bash

# Database Backup Utility Script
# Generates timestamped, compressed pg_dump archives and prunes old backups beyond retention limit.

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/workspace_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Load DB env vars or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-workspace_user}"
DB_NAME="${POSTGRES_DB:-workspace_db}"

mkdir -p "${BACKUP_DIR}"

echo "📦 Starting automated database backup for database '${DB_NAME}'..."

if command -v docker > /dev/null 2>&1 && docker ps | grep -q "workspace_postgres"; then
  echo "  Running backup inside Docker container 'workspace_postgres'..."
  docker exec -t workspace_postgres pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"
else
  echo "  Running pg_dump directly..."
  PGPASSWORD="${POSTGRES_PASSWORD:-workspace_pass}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ Backup successfully created: ${BACKUP_FILE} (${FILE_SIZE})"

# Prune old backups
echo "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "workspace_db_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;
echo "✨ Backup process finished successfully!"
