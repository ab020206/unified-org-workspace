# Environment Configuration Guide

## Environment Variables Reference

| Variable Name        | Required | Default Value            | Description                                                |
| :------------------- | :------- | :----------------------- | :--------------------------------------------------------- |
| `NODE_ENV`           | No       | `development`            | Runtime environment (`development`, `production`, `test`). |
| `PORT`               | No       | `4000`                   | Port for Express backend server.                           |
| `CLIENT_URL`         | No       | `http://localhost:3000`  | Allowed CORS origin for Next.js client.                    |
| `DATABASE_URL`       | **Yes**  | `postgresql://...`       | PostgreSQL connection string for Prisma.                   |
| `REDIS_URL`          | **Yes**  | `redis://localhost:6379` | Redis connection URL for caching and queues.               |
| `JWT_SECRET`         | **Yes**  | —                        | Minimum 16-character secret for access tokens (Phase 1).   |
| `JWT_REFRESH_SECRET` | **Yes**  | —                        | Secret for refresh tokens (Phase 1).                       |

---

## Validation Engine

Environment variables are strictly validated on server startup using **Zod** (`server/src/config/env.ts`). If any required variable is missing or malformed, the process exits with an explicit validation error message.
