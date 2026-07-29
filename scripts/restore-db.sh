#!/usr/bin/env bash

# Database Restore Utility Script
# Restores PostgreSQL database state from a compressed pg_dump archive file.

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Missing backup file path."
  echo "Usage: ./scripts/restore-db.sh <path-to-backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: File '${BACKUP_FILE}' does not exist."
  exit 1
fi

DB_USER="${POSTGRES_USER:-workspace_user}"
DB_NAME="${POSTGRES_DB:-workspace_db}"

echo "⚠️ WARNING: Restoring will overwrite existing data in database '${DB_NAME}'!"
read -p "Are you sure you want to proceed? (y/N): " CONFIRM
if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
  echo "Restoration cancelled."
  exit 0
fi

echo "🔄 Restoring database state from '${BACKUP_FILE}'..."

if command -v docker > /dev/null 2>&1 && docker ps | grep -q "workspace_postgres"; then
  gunzip -c "${BACKUP_FILE}" | docker exec -i workspace_postgres psql -U "${DB_USER}" -d "${DB_NAME}"
else
  gunzip -c "${BACKUP_FILE}" | psql -h localhost -U "${DB_USER}" -d "${DB_NAME}"
fi

echo "✅ Database restored successfully!"
