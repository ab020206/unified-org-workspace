# Architecture Guide — Unified Organization Workspace

## Layered Backend Architecture

The backend follows a strict 3-tier layered architecture:

```
HTTP Request
     │
     ▼
[ Controller ]   ---> Extract params, invoke service, return standardized JSON response
     │
     ▼
[ Service ]      ---> Business rules, orchestration, caching strategies (No Direct DB Access)
     │
     ▼
[ Repository ]   ---> Database queries (Prisma), Redis calls, raw data operations
```

### Architectural Principles

1. **No Business Logic in Controllers**: Controllers must strictly handle request parsing, status codes, and invoking services.
2. **Repository Pattern**: All database interactions pass through repository classes (`server/src/repositories/`).
3. **Dependency Injection**: Services receive repositories via class constructor injection.
4. **Structured Logging**: Every request is tagged with a unique `requestId` via UUID headers, logging execution duration, HTTP method, route, and status code.
5. **Standardized Responses**: All success & error outputs implement the `@workspace/shared-types` interface:
   ```json
   {
     "success": true,
     "message": "Health check completed",
     "data": { ... },
     "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
     "timestamp": "2026-07-28T08:00:00.000Z"
   }
   ```

---

## Phase 1 Readyness Architecture

### Shared Identity & RBAC

`packages/shared-types/src/rbac.ts` provides `Role` and `Permission` enums ready to be consumed by JWT middleware in Phase 1.

### Multi-Tenant Isolation

`packages/shared-types/src/organization.ts` and `client/components/OrgSwitcherPlaceholder.tsx` establish organization context propagation across all queries.
