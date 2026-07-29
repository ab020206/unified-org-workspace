# Monorepo Folder Explanation

```text
workspace/
│
├── client/                     # Next.js 15 App Router Frontend Shell
│   ├── app/                    # Next.js pages & dashboard layout
│   ├── components/             # Reusable Shell & UI components (Sidebar, Navbar, ThemeToggle)
│   ├── hooks/                  # Custom React Hooks
│   ├── services/               # API Client Services
│   ├── lib/                    # Utilities (clsx, tailwind-merge)
│   ├── providers/              # React Query Client & Next Themes Providers
│   ├── styles/                 # Global Tailwind HSL design token styles
│   └── types/                  # Client-specific UI state types
│
├── server/                     # Express.js Backend Server
│   ├── src/
│   │   ├── config/             # Zod validated env, Prisma, Redis clients
│   │   ├── controllers/        # Route controllers (Layer 1)
│   │   ├── middleware/         # Request ID, Pino Logger, Zod validator, Error Handler
│   │   ├── services/           # Business logic & orchestration (Layer 2)
│   │   ├── repositories/       # Prisma & Redis data access (Layer 3)
│   │   ├── routes/             # Express API routing (/api/v1)
│   │   ├── validators/         # Zod request validation schemas
│   │   ├── utils/              # Pino logger & ApiError standard utilities
│   │   ├── jobs/               # Background worker placeholders (BullMQ)
│   │   ├── types/              # Server-specific types
│   │   └── server.ts           # Server entrypoint & graceful shutdown
│   └── prisma/                 # Prisma schema & seed framework
│
├── packages/                   # Shared Monorepo Packages
│   ├── shared-types/           # ApiResponse, Roles, Permissions, Org interfaces
│   ├── shared-utils/           # Response builders & type guards
│   └── shared-config/          # Base TypeScript & Lint presets
│
├── docker/                     # Dockerfile.server & Dockerfile.client
├── docs/                       # Architecture, Environment & Setup Guides
└── docker-compose.yml          # Container orchestration (Postgres, Redis, Server, Client)
```
