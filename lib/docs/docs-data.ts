export interface DocTocItem {
  id: string;
  title: string;
  level: number;
}

export interface DocCodeSnippet {
  language: string;
  filename?: string;
  code: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  callout?: {
    type: 'note' | 'tip' | 'important' | 'warning' | 'caution';
    title: string;
    text: string;
  };
  codeSnippet?: DocCodeSnippet;
  bullets?: string[];
  steps?: { stepNumber: number; title: string; text: string }[];
}

export interface DocArticle {
  slug: string;
  title: string;
  subtitle: string;
  category: 'Overview' | 'Platform Basics' | 'Core Modules' | 'Enterprise & Security' | 'Developer & API' | 'Operations';
  categoryOrder: number;
  iconName: string;
  readingTime: string;
  lastUpdated: string;
  summary: string;
  toc: DocTocItem[];
  overview: string;
  concept: string;
  features: string[];
  sections: DocSection[];
  bestPractices: string[];
  tips: string[];
  commonMistakes: string[];
  notes: string[];
  relatedSlugs: string[];
}

export interface ApiEndpointSpec {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authRequired: boolean;
  headers: { key: string; value: string; required: boolean; description: string }[];
  queryParams?: { key: string; type: string; required: boolean; description: string }[];
  requestBody?: {
    sampleJson: string;
    schemaDescription: string;
  };
  responses: {
    status: number;
    description: string;
    sampleJson: string;
  }[];
  codeSamples: {
    typescript: string;
    javascript: string;
    curl: string;
    serverActions: string;
  };
}

export interface FaqItem {
  id: string;
  category: 'General' | 'Organizations & Access' | 'Security & Compliance' | 'AI Workspace' | 'Billing & Infrastructure';
  question: string;
  answer: string;
  tags: string[];
}

export interface ChangelogRelease {
  version: string;
  date: string;
  title: string;
  badgeText: string;
  badgeVariant: 'primary' | 'success' | 'info' | 'warning';
  description: string;
  highlights: {
    type: 'feature' | 'security' | 'performance' | 'fix';
    title: string;
    description: string;
  }[];
}

export const DOCS_CATEGORIES = [
  { id: 'Overview', name: 'Overview', order: 1 },
  { id: 'Platform Basics', name: 'Platform Basics', order: 2 },
  { id: 'Core Modules', name: 'Core Modules', order: 3 },
  { id: 'Enterprise & Security', name: 'Enterprise & Security', order: 4 },
  { id: 'Developer & API', name: 'Developer & API', order: 5 },
  { id: 'Operations', name: 'Operations', order: 6 },
] as const;

export const DOCS_ARTICLES: Record<string, DocArticle> = {
  'getting-started': {
    slug: 'getting-started',
    title: 'Getting Started',
    subtitle: 'Quickstart guide to set up your workspace, invite your team, and launch core modules.',
    category: 'Overview',
    categoryOrder: 1,
    iconName: 'Rocket',
    readingTime: '5 min read',
    lastUpdated: 'July 2026',
    summary: 'Everything you need to initialize your Froncort Enterprise environment in under 10 minutes.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'concept', title: 'Architecture Concept', level: 2 },
      { id: 'key-features', title: 'Key Onboarding Features', level: 2 },
      { id: 'step-by-step', title: 'Step-by-Step Setup Guide', level: 2 },
      { id: 'best-practices', title: 'Best Practices', level: 2 },
      { id: 'tips-and-troubleshooting', title: 'Tips & Troubleshooting', level: 2 },
    ],
    overview:
      'Unified Workspace is an integrated enterprise platform designed by Froncort. It provides unified issue tracking, pull request code review workflows, AI executive summaries, and knowledge graphs under strict tenant isolation. This guide takes you from initial registration to configuring your first organization and executing AI Digests.',
    concept:
      'The platform engineered by Froncort uses multi-tenant data partitioning coupled with Role-Based Access Control (RBAC). Every user belongs to one or more Organizations. Within an Organization, resources (Tickets, Pull Requests, Knowledge Graphs) are strictly scoped and audited.',
    features: [
      'Multi-Tenant Workspace Partitioning',
      'Unified Identity & Session Management',
      'Automated Team Onboarding & Invite Links',
      'AI Digest Initialization',
      'Role-Based Permission Rules (Owner, Admin, Member, Viewer)',
    ],
    sections: [
      {
        id: 'step-by-step',
        title: 'Step-by-Step Setup Guide',
        content: 'Follow these core steps to initialize your enterprise instance:',
        steps: [
          {
            stepNumber: 1,
            title: 'Create your Master Account',
            text: 'Navigate to /register and complete the initial account registration form with your work email and strong password.',
          },
          {
            stepNumber: 2,
            title: 'Provision an Organization',
            text: 'Prompted upon first login, enter your organization name, slug identifier, and select your initial region or environment tier.',
          },
          {
            stepNumber: 3,
            title: 'Invite Team Members',
            text: 'Go to Organization Settings > Members and send email invitations or generate secure single-use invitation tokens.',
          },
          {
            stepNumber: 4,
            title: 'Configure Feature Flags & Integrations',
            text: 'Enable AI Digests, Knowledge Graph visualization, and audit logging in the Feature Flags dashboard.',
          },
        ],
        callout: {
          type: 'tip',
          title: 'Pro Tip',
          text: 'You can switch between multiple organizations seamlessly from the top navigation dropdown without needing to re-authenticate.',
        },
        codeSnippet: {
          language: 'typescript',
          filename: 'initialize-workspace.ts',
          code: `import { FroncortClient } from '@froncort/sdk';

const client = new FroncortClient({
  apiKey: process.env.FRONCORT_API_KEY,
  organizationId: 'org_acme_corp_01'
});

// Initialize workspace health check
const health = await client.system.getHealthStatus();
console.log('System Status:', health.status);`,
        },
      },
    ],
    bestPractices: [
      'Always enforce Multi-Factor Authentication (MFA) on Admin accounts.',
      'Use organization slug naming conventions aligned with your internal domain.',
      'Assign minimal required roles (e.g. Member or Viewer) to new users by default.',
    ],
    tips: [
      'Use Cmd+K anywhere in the dashboard to open the Global Command Palette.',
      'Enable dark mode using the header sun/moon toggle for high-contrast viewing.',
    ],
    commonMistakes: [
      'Creating multiple personal organizations instead of joining team workspaces.',
      'Sharing API secret tokens in client-side code instead of environment variables.',
    ],
    notes: [
      'Audit trails log all account creation and organization switching events for compliance.',
    ],
    relatedSlugs: ['authentication', 'organizations', 'rbac'],
  },

  authentication: {
    slug: 'authentication',
    title: 'Authentication & Sessions',
    subtitle: 'Comprehensive guide to JWT authentication, refresh token rotation, and RBAC security.',
    category: 'Platform Basics',
    categoryOrder: 2,
    iconName: 'Lock',
    readingTime: '7 min read',
    lastUpdated: 'July 2026',
    summary: 'Learn how Froncort handles secure sign-in, JWT token lifecycle, session revocation, and tenant context.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'jwt-flow', title: 'JWT & Session Lifecycle', level: 2 },
      { id: 'org-context', title: 'Organization Switching Context', level: 2 },
      { id: 'code-example', title: 'Authentication Code Example', level: 2 },
      { id: 'best-practices', title: 'Security Best Practices', level: 2 },
    ],
    overview:
      'Froncort relies on JSON Web Tokens (JWT) stored in HTTP-Only, Secure cookies to protect API routes and dashboard pages. Sessions are continuously verified against Redis revocation lists to ensure immediate invalidation upon logout or role revocation.',
    concept:
      'When a user authenticates, the server issues an Access Token (15-minute TTL) and a Refresh Token (7-day TTL). The Refresh Token is bound to the device fingerprint and user session record in PostgreSQL.',
    features: [
      'Stateless Access Token Verification with RSA Keypair Signatures',
      'Automatic Refresh Token Rotation on Expiration',
      'Concurrent Active Session Management & Remote Logout',
      'Tenant Header Injection (x-organization-id)',
      'Brute-force Rate Limiting (5 failed attempts per minute)',
    ],
    sections: [
      {
        id: 'jwt-flow',
        title: 'JWT & Session Lifecycle',
        content: 'Understanding how tokens move between client and server:',
        bullets: [
          'Client sends credentials to POST /api/auth/login.',
          'Server verifies bcrypt password hash and generates signed JWT containing userId, email, and active orgId.',
          'HTTP-Only auth_token cookie is attached to HTTP response.',
          'Middleware reads auth_token cookie on every incoming request to hydrate session context.',
        ],
        callout: {
          type: 'important',
          title: 'Cookie Security',
          text: 'Cookies are set with SameSite=Lax, HttpOnly=true, and Secure=true in production to protect against XSS and CSRF attacks.',
        },
      },
      {
        id: 'code-example',
        title: 'Authentication Code Example',
        content: 'Sample authentication request using TypeScript fetch:',
        codeSnippet: {
          language: 'typescript',
          filename: 'auth-login.ts',
          code: `const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@acme.corp',
    password: 'SuperSecretPassword123!',
  }),
});

const data = await response.json();
if (response.ok) {
  console.log('Login successful:', data.user);
} else {
  console.error('Login error:', data.error);
}`,
        },
      },
    ],
    bestPractices: [
      'Never store access tokens in localStorage or sessionStorage.',
      'Revoke all user sessions immediately when modifying permissions or roles.',
    ],
    tips: [
      'You can review active sessions and revoke specific IP locations under Account Settings > Security.',
    ],
    commonMistakes: [
      'Omitting credentials: "include" when making cross-origin fetch calls.',
    ],
    notes: [
      'Sessions automatically expire after 24 hours of total inactivity.',
    ],
    relatedSlugs: ['security', 'rbac', 'users'],
  },

  organizations: {
    slug: 'organizations',
    title: 'Organizations & Multi-Tenancy',
    subtitle: 'Manage workspace tenant isolation, member invitations, and organization switching.',
    category: 'Platform Basics',
    categoryOrder: 2,
    iconName: 'Building2',
    readingTime: '6 min read',
    lastUpdated: 'July 2026',
    summary: 'Detailed explanation of tenant data isolation, organization settings, and member rosters.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'tenant-isolation', title: 'Tenant Data Isolation', level: 2 },
      { id: 'member-invites', title: 'Member Invitation Flow', level: 2 },
      { id: 'code-example', title: 'Organization Management API', level: 2 },
    ],
    overview:
      'Organizations represent isolated tenants within the Froncort platform. All database queries for tickets, pull requests, knowledge graphs, and AI digests are strictly constrained by the active organization ID.',
    concept:
      'Multi-tenancy in Froncort uses a shared-database, row-level tenant identification architecture. Every database table includes an organizationId foreign key with strict index enforcing.',
    features: [
      'Instant Organization Switching',
      'Secure Tokenized Email Invitations',
      'Custom Organization Domains & Slugs',
      'Tenant-specific Quotas & Feature Toggles',
      'Organization Audit Event Logging',
    ],
    sections: [
      {
        id: 'tenant-isolation',
        title: 'Tenant Data Isolation',
        content: 'Data safety mechanisms built into the core framework:',
        bullets: [
          'Prisma middleware automatically injects organizationId into every database query filter.',
          'Cross-tenant data access attempts return 404 Not Found or 403 Forbidden.',
          'Redis keys are namespaced with orgId (e.g. org:acme:digest:cache).',
        ],
        callout: {
          type: 'warning',
          title: 'Isolation Guarantee',
          text: 'Even API requests with valid user tokens will fail if the user does not possess an active membership in the target organization.',
        },
      },
      {
        id: 'code-example',
        title: 'Organization Management API',
        content: 'Creating a new Organization programmatically:',
        codeSnippet: {
          language: 'typescript',
          filename: 'create-organization.ts',
          code: `const response = await fetch('/api/organizations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-organization-id': 'org_current',
  },
  body: JSON.stringify({
    name: 'DevOps & AI Research',
    slug: 'devops-ai-research',
  }),
});

const result = await response.json();
console.log('New Org Created:', result.organization);`,
        },
      },
    ],
    bestPractices: [
      'Limit Owner roles to a minimum of 2 trusted enterprise administrators.',
      'Regularly audit pending email invitations to revoke unused tokens.',
    ],
    tips: [
      'Organization slugs can be used in API calls and webhook registrations.',
    ],
    commonMistakes: [
      'Attempting to delete an organization with active billing subscriptions.',
    ],
    notes: [
      'Deleting an organization performs soft-deletion for 30 days before permanent purging.',
    ],
    relatedSlugs: ['rbac', 'users', 'security'],
  },

  users: {
    slug: 'users',
    title: 'User Management',
    subtitle: 'Manage user profiles, accounts, active states, and user lifecycle events.',
    category: 'Platform Basics',
    categoryOrder: 2,
    iconName: 'Users',
    readingTime: '4 min read',
    lastUpdated: 'July 2026',
    summary: 'Learn how to manage team profiles, status updates, and avatar media uploads.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'user-lifecycle', title: 'User Lifecycle & States', level: 2 },
      { id: 'profile-settings', title: 'Profile Settings & Preferences', level: 2 },
    ],
    overview:
      'The User directory tracks all account identities across your enterprise organizations. Admins can manage account status (Active, Suspended, Deactivated) and monitor user activity logs.',
    concept:
      'A User account exists globally, while their access privileges are determined per-organization via the Member mapping table.',
    features: [
      'Global User Identity with Per-Org Roles',
      'Account Deactivation & Suspension Controls',
      'Real-time User Activity Status',
      'Avatar Image Upload & Storage',
      'Security Alert Email Preferences',
    ],
    sections: [
      {
        id: 'user-lifecycle',
        title: 'User Lifecycle & States',
        content: 'User accounts navigate through three main operational states:',
        bullets: [
          'Active: Full access to permitted organization resources.',
          'Suspended: Temporary block on login attempts without deleting data.',
          'Deactivated: Account access revoked permanently; transferred ownership.',
        ],
      },
    ],
    bestPractices: [
      'Deactivate accounts immediately during employee offboarding.',
    ],
    tips: [
      'Filter users by active role in the Users table for quick auditing.',
    ],
    commonMistakes: [
      'Deleting a user account instead of transferring ownership of critical tickets.',
    ],
    notes: [
      'All user updates generate irreversible audit trail records.',
    ],
    relatedSlugs: ['organizations', 'rbac', 'security'],
  },

  rbac: {
    slug: 'rbac',
    title: 'Role-Based Access Control (RBAC)',
    subtitle: 'Configure fine-grained permissions, system roles, and scoping rules.',
    category: 'Platform Basics',
    categoryOrder: 2,
    iconName: 'Shield',
    readingTime: '6 min read',
    lastUpdated: 'July 2026',
    summary: 'Detailed explanation of Owner, Admin, Member, and Viewer permissions matrix.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'roles-matrix', title: 'Permissions Matrix', level: 2 },
      { id: 'scoping-rules', title: 'Resource Scoping Rules', level: 2 },
    ],
    overview:
      'RBAC controls authorization across all Froncort features. Permissions are evaluated on every API call and UI action to prevent privilege escalation.',
    concept:
      'Permissions are hierarchically structured: Owner > Admin > Member > Viewer. Custom permission overrides can also be configured per resource group.',
    features: [
      'Pre-built System Roles (Owner, Admin, Member, Viewer)',
      'Fine-grained API Endpoint Guards',
      'UI Action Hiding & Disabling',
      'Permission Audit Records',
    ],
    sections: [
      {
        id: 'roles-matrix',
        title: 'Permissions Matrix',
        content: 'System permissions broken down by role:',
        bullets: [
          'Owner: Full control including organization deletion, billing, and root RBAC edits.',
          'Admin: Can invite members, create feature flags, trigger digests, and manage tickets.',
          'Member: Can create & edit tickets, submit pull requests, and view analytics.',
          'Viewer: Read-only access to tickets, pull requests, and documentation.',
        ],
        callout: {
          type: 'note',
          title: 'Permission Enforcement',
          text: 'Permission checks occur in both client-side layout guards and server-side API route handlers.',
        },
      },
    ],
    bestPractices: [
      'Apply the principle of least privilege when assigning roles.',
    ],
    tips: [
      'Use the RBAC modal under Members table to edit user roles with one click.',
    ],
    commonMistakes: [
      'Granting Admin role when Member role is sufficient for daily workflows.',
    ],
    notes: [
      'Role updates take effect immediately without requiring user re-login.',
    ],
    relatedSlugs: ['organizations', 'users', 'security'],
  },

  tickets: {
    slug: 'tickets',
    title: 'Ticket & Issue Tracking',
    subtitle: 'Manage issue tracking, task velocity, priority assignment, and ticket workflows.',
    category: 'Core Modules',
    categoryOrder: 3,
    iconName: 'Ticket',
    readingTime: '5 min read',
    lastUpdated: 'July 2026',
    summary: 'Master issue tracking, status boards, priority tags, and automated ticket transitions.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'board-views', title: 'Kanban & List Views', level: 2 },
      { id: 'lifecycle-status', title: 'Ticket Lifecycle States', level: 2 },
      { id: 'code-example', title: 'Creating Tickets via API', level: 2 },
    ],
    overview:
      'Froncort Ticket Management enables software development and operational teams to track bugs, features, and tasks alongside pull requests and automated AI digests.',
    concept:
      'Tickets are linked directly to GitHub Pull Requests and Knowledge Graph nodes, creating a unified traceability pipeline from issue to production build.',
    features: [
      'Interactive Kanban Board & List Views',
      'Priority Scoring (Low, Medium, High, Urgent)',
      'Custom Status Columns (Backlog, Todo, In Progress, Review, Done)',
      'Assignee & Reporter Tracking',
      'Automated PR Association via Keyword (#123)',
    ],
    sections: [
      {
        id: 'lifecycle-status',
        title: 'Ticket Lifecycle States',
        content: 'State transitions and automation rules:',
        bullets: [
          'Backlog -> Todo: Prioritized by project leads.',
          'Todo -> In Progress: Developer assigned.',
          'In Progress -> Review: Linked Pull Request created.',
          'Review -> Done: PR merged to main branch.',
        ],
      },
      {
        id: 'code-example',
        title: 'Creating Tickets via API',
        content: 'Submit a new ticket using the REST API:',
        codeSnippet: {
          language: 'typescript',
          filename: 'create-ticket.ts',
          code: `const response = await fetch('/api/tickets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-organization-id': 'org_acme_01',
  },
  body: JSON.stringify({
    title: 'Optimize Redis Cache Eviction Policy',
    description: 'Implement LRU caching for frequent AI Digest requests.',
    priority: 'HIGH',
    status: 'TODO',
    tags: ['performance', 'redis'],
  }),
});

const data = await response.json();
console.log('Created Ticket ID:', data.ticket.id);`,
        },
      },
    ],
    bestPractices: [
      'Always reference ticket IDs in Pull Request titles for automatic linking.',
    ],
    tips: [
      'Filter tickets by assignee or priority using the filter bar in the Tickets view.',
    ],
    commonMistakes: [
      'Leaving tickets in "In Progress" without assigned owners.',
    ],
    notes: [
      'Ticket activity logs track every comment, status shift, and tag edit.',
    ],
    relatedSlugs: ['pull-requests', 'ai-digest', 'knowledge-graph'],
  },

  'pull-requests': {
    slug: 'pull-requests',
    title: 'Pull Requests & Code Reviews',
    subtitle: 'Track code changes, review velocity, automated diff analysis, and CI/CD status.',
    category: 'Core Modules',
    categoryOrder: 3,
    iconName: 'GitPullRequest',
    readingTime: '5 min read',
    lastUpdated: 'July 2026',
    summary: 'Monitor code reviews, automated CI checks, diff metrics, and AI digestion.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'pr-workflow', title: 'Code Review Workflow', level: 2 },
      { id: 'ci-checks', title: 'Status Checks & Automated Digests', level: 2 },
    ],
    overview:
      'The Pull Request module aggregates code changes across connected Git repositories, surfacing code review progress, CI pipeline statuses, and automated risk analysis.',
    concept:
      'PRs are ingested via Webhooks or manual API submissions. AI background workers scan PR diffs to generate change impact summaries for management digests.',
    features: [
      'Unified PR Overview across Repositories',
      'Branch & Diff Metrics (+ additions / - deletions)',
      'Reviewer Approval Tracking',
      'Automated AI Digest Extraction',
      'Direct Issue Linking',
    ],
    sections: [
      {
        id: 'pr-workflow',
        title: 'Code Review Workflow',
        content: 'How pull requests move from open to merged:',
        bullets: [
          'Developer opens PR on GitHub / GitLab.',
          'Froncort Webhook catches event and updates PR status.',
          'Reviewers inspect diffs and issue approval.',
          'AI Digest engine summarizes changes for executive reporting.',
        ],
      },
    ],
    bestPractices: [
      'Keep pull request sizes small (<400 lines) for faster review and AI digestion.',
    ],
    tips: [
      'Click on any PR card to inspect linked tickets and automated summaries.',
    ],
    commonMistakes: [
      'Merging PRs without waiting for automated CI checks to succeed.',
    ],
    notes: [
      'PR data is stored encrypted at rest.',
    ],
    relatedSlugs: ['tickets', 'ai-digest', 'webhooks'],
  },

  'ai-digest': {
    slug: 'ai-digest',
    title: 'AI Workspace & Executive Digest',
    subtitle: 'Automated executive summaries, prompt playground, Gemini model provider, and background jobs.',
    category: 'Core Modules',
    categoryOrder: 3,
    iconName: 'Sparkles',
    readingTime: '7 min read',
    lastUpdated: 'July 2026',
    summary: 'Deep dive into AI Executive Digests, token counting, worker queues, and prompt playground.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'generation-flow', title: 'AI Generation Pipeline Architecture', level: 2 },
      { id: 'prompt-playground', title: 'Prompt Playground & Custom Prompts', level: 2 },
      { id: 'worker-queue', title: 'Background Job Queues & Redis', level: 2 },
      { id: 'code-example', title: 'Triggering AI Digest via API', level: 2 },
    ],
    overview:
      'Froncort AI Workspace synthesizes ticket updates, pull request code diffs, and security events into high-level Executive Digests. Powered by Google Gemini 1.5/3.6 Flash models, it provides instant executive visibility.',
    concept:
      'Raw workspace telemetry is collected continuously, stripped of PII/sensitive tokens, packaged into structured prompts, and evaluated asynchronously via background worker threads.',
    features: [
      'Automated Daily / Weekly Executive Summary Generation',
      'Token Usage Tracking & Cost Estimation',
      'Interactive Prompt Playground for Custom Reports',
      'Redis-backed Async Queue Execution',
      'Historical Digest Archives & Export Options',
    ],
    sections: [
      {
        id: 'generation-flow',
        title: 'AI Generation Pipeline Architecture',
        content: 'The end-to-end flow of generating an AI Executive Digest:',
        steps: [
          {
            stepNumber: 1,
            title: 'Telemetry Gathering',
            text: 'Collect resolved tickets, merged pull requests, and audit logs within the target timeframe.',
          },
          {
            stepNumber: 2,
            title: 'Anonymization & Token Truncation',
            text: 'Filter out secret keys, password hashes, and format telemetry into structured Markdown.',
          },
          {
            stepNumber: 3,
            title: 'Background Job Dispatch',
            text: 'Enqueue job into Redis queue; worker process handles API payload call to Gemini model.',
          },
          {
            stepNumber: 4,
            title: 'Synthesis & Storage',
            text: 'Parse AI JSON response into key highlights, risks, and recommendations. Persist to database.',
          },
        ],
        callout: {
          type: 'important',
          title: 'Privacy Guarantee',
          text: 'Customer data is never used to train global AI models. API calls use zero-data-retention enterprise endpoints.',
        },
      },
      {
        id: 'code-example',
        title: 'Triggering AI Digest via API',
        content: 'Trigger a new Executive Digest asynchronously:',
        codeSnippet: {
          language: 'typescript',
          filename: 'trigger-digest.ts',
          code: `const response = await fetch('/api/digest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-organization-id': 'org_acme_01',
  },
  body: JSON.stringify({
    timeframe: 'WEEKLY',
    includePrs: true,
    includeTickets: true,
    customInstructions: 'Focus on security vulnerabilities and release blockers.',
  }),
});

const result = await response.json();
console.log('Digest Job Queued:', result.jobId);`,
        },
      },
    ],
    bestPractices: [
      'Schedule digests during off-peak hours for optimal background queue throughput.',
      'Refine custom instructions in Prompt Playground before generating organization-wide digests.',
    ],
    tips: [
      'You can export any AI Digest as PDF or Markdown from the Digest page.',
    ],
    commonMistakes: [
      'Exceeding maximum context token limits by including un-truncated log files.',
    ],
    notes: [
      'Token consumption is logged per organization for transparent usage billing.',
    ],
    relatedSlugs: ['analytics', 'knowledge-graph', 'tickets'],
  },

  security: {
    slug: 'security',
    title: 'Enterprise Security Architecture',
    subtitle: 'Tenant isolation, audit logging, rate limiting, security headers, and vulnerability protection.',
    category: 'Enterprise & Security',
    categoryOrder: 4,
    iconName: 'ShieldCheck',
    readingTime: '8 min read',
    lastUpdated: 'July 2026',
    summary: 'Comprehensive overview of Froncort SOC2 compliance, encryption, and threat mitigations.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'threat-mitigation', title: 'Threat Mitigations & Defense', level: 2 },
      { id: 'audit-logging', title: 'Audit Trail & Compliance', level: 2 },
      { id: 'rate-limiting', title: 'Rate Limiting & DDOS Protection', level: 2 },
    ],
    overview:
      'Froncort is engineered with defense-in-depth security principles. From row-level tenant isolation to cryptographically signed tokens and automated vulnerability scanning, your enterprise assets are shielded.',
    concept:
      'Security is enforced at every layer: Edge middleware headers, API route rate-limiters, Prisma query filters, and database column encryption.',
    features: [
      'ROW-Level Tenant Isolation Enforcement',
      'Immutable Audit Log Records with User IP & User-Agent',
      'Redis-backed Sliding Window Rate Limiting',
      'OWASP Top 10 Protections (XSS, CSRF, SQLi)',
      'Strict Content Security Policy (CSP) & HSTS Headers',
    ],
    sections: [
      {
        id: 'threat-mitigation',
        title: 'Threat Mitigations & Defense',
        content: 'Active countermeasures built into the platform:',
        bullets: [
          'SQL Injection: All database interaction is parameterized using Prisma ORM prepared statements.',
          'Cross-Site Scripting (XSS): React JSX auto-escaping combined with DOMPurify sanitization.',
          'Cross-Site Request Forgery (CSRF): SameSite=Lax cookie attribute and strict Origin header validation.',
          'Session Hijacking: Automatic session revocation upon IP geographical anomaly detection.',
        ],
        callout: {
          type: 'caution',
          title: 'Audit Retention',
          text: 'Audit logs cannot be modified or deleted, even by Organization Owners, ensuring tamper-evident compliance.',
        },
      },
    ],
    bestPractices: [
      'Integrate audit logs with your SIEM via webhooks.',
      'Regularly review session revocation logs under Security Dashboard.',
    ],
    tips: [
      'Enable strict IP whitelisting for organization API access in Enterprise tier.',
    ],
    commonMistakes: [
      'Disabling security headers in custom reverse proxy configurations.',
    ],
    notes: [
      'Froncort undergoes bi-annual third-party penetration testing.',
    ],
    relatedSlugs: ['authentication', 'rbac', 'webhooks'],
  },

  analytics: {
    slug: 'analytics',
    title: 'Workspace Analytics & Insights',
    subtitle: 'Measure velocity, issue resolution times, API response metrics, and token usage.',
    category: 'Enterprise & Security',
    categoryOrder: 4,
    iconName: 'BarChart3',
    readingTime: '4 min read',
    lastUpdated: 'July 2026',
    summary: 'Monitor workspace productivity, response latency, and operational telemetry.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'metrics-breakdown', title: 'Telemetry Metrics Breakdown', level: 2 },
    ],
    overview:
      'Workspace Analytics aggregates historical activity to give managers clear metrics on ticket throughput, PR cycle times, AI usage trends, and system performance.',
    concept:
      'Real-time event streams are processed into hourly and daily summary snapshots stored in optimized analytical tables.',
    features: [
      'Ticket Throughput Velocity Charts',
      'Pull Request Cycle Time Tracking',
      'AI Token Burn-down Metrics',
      'API Request Latency & Error Rate Graphs',
    ],
    sections: [
      {
        id: 'metrics-breakdown',
        title: 'Telemetry Metrics Breakdown',
        content: 'Key charts available in the Analytics dashboard:',
        bullets: [
          'Cycle Time: Average hours from PR creation to merge.',
          'Resolution Speed: Average time tickets stay in In Progress state.',
          'AI Efficiency Score: Calculated ratio of manual digests vs AI-assisted reports.',
        ],
      },
    ],
    bestPractices: [
      'Use analytics to identify sprint bottlenecks rather than evaluating individual developers.',
    ],
    tips: [
      'Export raw CSV telemetry for custom BI dashboard integration.',
    ],
    commonMistakes: [
      'Comparing velocity across teams with different ticket sizing practices.',
    ],
    notes: [
      'Analytics metrics refresh every 15 minutes.',
    ],
    relatedSlugs: ['tickets', 'pull-requests', 'ai-digest'],
  },

  'feature-flags': {
    slug: 'feature-flags',
    title: 'Feature Flags & Controls',
    subtitle: 'Control feature rollouts, target specific user groups, and manage emergency kill switches.',
    category: 'Enterprise & Security',
    categoryOrder: 4,
    iconName: 'ToggleLeft',
    readingTime: '5 min read',
    lastUpdated: 'July 2026',
    summary: 'Learn how to toggle features in real time without redeploying code.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'flag-evaluation', title: 'Flag Evaluation Architecture', level: 2 },
      { id: 'code-example', title: 'Feature Flag Code Example', level: 2 },
    ],
    overview:
      'Feature Flags empower teams to decouple feature deployment from code release. Safely test new features in staging or rollout capabilities gradually to percentage cohorts.',
    concept:
      'Flags are evaluated in-memory using cached rules stored in Redis. Evaluation latency is under 2 milliseconds.',
    features: [
      'Boolean & Percentage Rollout Toggles',
      'Targeting Rules by User Role or Email Domain',
      'Emergency Master Kill Switch',
      'Audit Logging of Flag Modifications',
    ],
    sections: [
      {
        id: 'code-example',
        title: 'Feature Flag Code Example',
        content: 'Evaluating flags in React component logic:',
        codeSnippet: {
          language: 'typescript',
          filename: 'FeatureComponent.tsx',
          code: `import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export function KnowledgeGraphWidget() {
  const { enabled, loading } = useFeatureFlag('enable_knowledge_graph');

  if (loading) return <div>Loading feature...</div>;
  if (!enabled) return null;

  return <KnowledgeGraphCanvas />;
}`,
        },
      },
    ],
    bestPractices: [
      'Clean up stale feature flags once a feature is 100% rolled out.',
    ],
    tips: [
      'Use percentage rollouts (e.g. 10% -> 50% -> 100%) for major architecture migrations.',
    ],
    commonMistakes: [
      'Hardcoding flag keys in multiple locations instead of using a constant file.',
    ],
    notes: [
      'Flag evaluations are logged to track feature usage statistics.',
    ],
    relatedSlugs: ['knowledge-graph', 'security', 'analytics'],
  },

  'knowledge-graph': {
    slug: 'knowledge-graph',
    title: 'Knowledge Graph Visualization',
    subtitle: 'Explore system relationships, entity dependencies, and interactive knowledge maps.',
    category: 'Core Modules',
    categoryOrder: 3,
    iconName: 'Network',
    readingTime: '5 min read',
    lastUpdated: 'July 2026',
    summary: 'Visualize cross-entity links between tickets, pull requests, users, and AI insights.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'graph-nodes', title: 'Nodes & Relationship Edges', level: 2 },
    ],
    overview:
      'The Knowledge Graph module renders interactive topological diagrams showing how tasks, code commits, team members, and AI summaries intersect.',
    concept:
      'Graph nodes represent core workspace entities (Tickets, PRs, Users, AI Digests), while edges represent semantic links (e.g., ASSIGNED_TO, RESOLVES, DIGESTED_BY).',
    features: [
      'Interactive Canvas Zoom & Pan Controls',
      'Node Type Filtering & Color Coding',
      'Semantic Search & Node Highlighting',
      'Direct Inspector Drawer Navigation',
    ],
    sections: [
      {
        id: 'graph-nodes',
        title: 'Nodes & Relationship Edges',
        content: 'Entity types supported in the visualizer:',
        bullets: [
          'Ticket Node (Blue): Represents tasks and issue trackers.',
          'PR Node (Purple): Represents code review pull requests.',
          'User Node (Green): Represents active team members.',
          'Digest Node (Pink): Represents AI generated summaries.',
        ],
      },
    ],
    bestPractices: [
      'Use graph filters to isolate specific sprint dependencies.',
    ],
    tips: [
      'Clicking any graph node opens the Inspector Drawer on the right.',
    ],
    commonMistakes: [
      'Attempting to render >10,000 nodes without enabling cluster aggregation.',
    ],
    notes: [
      'Graph layout calculations use web worker threads to avoid UI thread blocking.',
    ],
    relatedSlugs: ['tickets', 'pull-requests', 'ai-digest'],
  },

  notifications: {
    slug: 'notifications',
    title: 'Notifications & Alerts',
    subtitle: 'Configure real-time alerts, email digests, system events, and notification rules.',
    category: 'Platform Basics',
    categoryOrder: 2,
    iconName: 'Bell',
    readingTime: '4 min read',
    lastUpdated: 'July 2026',
    summary: 'Manage in-app notification bells, unread counters, and email alert delivery.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'channels', title: 'Notification Channels', level: 2 },
    ],
    overview:
      'Notifications keep team members updated on critical events, including ticket assignments, PR reviews, AI digest completions, and security alerts.',
    concept:
      'Events are broadcast via Server-Sent Events (SSE) or WebSockets to active browser tabs, while secondary alerts are dispatched via email or webhooks.',
    features: [
      'Real-time In-App Notification Bell & Badge',
      'Categorized Notification Filter (All, Unread, Mentions)',
      'Mark as Read & Batch Actions',
      'Per-User Preference Controls',
    ],
    sections: [
      {
        id: 'channels',
        title: 'Notification Channels',
        content: 'Supported delivery mechanisms:',
        bullets: [
          'In-App Bell: Instant visual indicators in header navigation.',
          'Email Alerts: Instant or batch daily digests.',
          'Webhook Dispatches: Integration with Slack, Teams, or custom endpoints.',
        ],
      },
    ],
    bestPractices: [
      'Configure email notifications to "Digest Mode" to prevent inbox clutter.',
    ],
    tips: [
      'Use the "Mark all as read" button to clear notifications quickly.',
    ],
    commonMistakes: [
      'Disabling security alert notifications on enterprise admin accounts.',
    ],
    notes: [
      'Notifications are retained for 90 days before archiving.',
    ],
    relatedSlugs: ['tickets', 'webhooks', 'users'],
  },

  api: {
    slug: 'api',
    title: 'REST API Reference',
    subtitle: 'Complete API documentation with interactive explorer, authentication, and code samples.',
    category: 'Developer & API',
    categoryOrder: 5,
    iconName: 'Code',
    readingTime: '10 min read',
    lastUpdated: 'July 2026',
    summary: 'Explore all REST endpoints, request parameters, response schemas, and mock execution.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'authentication-header', title: 'API Authentication', level: 2 },
      { id: 'api-explorer', title: 'Interactive API Explorer', level: 2 },
      { id: 'endpoints-reference', title: 'Endpoint Index', level: 2 },
      { id: 'error-codes', title: 'Standard Error Codes', level: 2 },
    ],
    overview:
      'The Froncort REST API allows developers to programmatically manage organizations, tickets, pull requests, AI digests, and audit logs. All requests must be sent over HTTPS with proper header authorization.',
    concept:
      'The API follows standard REST principles using standard HTTP methods (GET, POST, PUT, DELETE) and JSON request/response payloads.',
    features: [
      'Strict JSON Request & Response Formatting',
      'Header-based Organization Context (x-organization-id)',
      'Interactive Endpoint Explorer & Request Testing',
      'Multi-Language Code Snippet Generation (TypeScript, JavaScript, cURL, Server Actions)',
      'Comprehensive Error Status Codes & Payloads',
    ],
    sections: [
      {
        id: 'authentication-header',
        title: 'API Authentication',
        content: 'Include your authentication credentials and tenant headers in all requests:',
        codeSnippet: {
          language: 'bash',
          filename: 'curl-example.sh',
          code: `curl -X GET "https://app.froncort.ai/api/organizations" \\
  -H "Authorization: Bearer froncort_pat_9876543210" \\
  -H "x-organization-id: org_acme_corp_01" \\
  -H "Content-Type: application/json"`,
        },
        callout: {
          type: 'important',
          title: 'Organization Header Required',
          text: 'All endpoints except /api/auth require the x-organization-id header to identify the target tenant.',
        },
      },
      {
        id: 'error-codes',
        title: 'Standard Error Codes',
        content: 'Common HTTP response error codes returned by the API:',
        bullets: [
          '400 Bad Request: Invalid JSON payload or missing required fields.',
          '401 Unauthorized: Invalid or expired authentication token.',
          '403 Forbidden: Insufficient RBAC privileges or invalid organization membership.',
          '404 Not Found: Resource does not exist or belongs to another tenant.',
          '429 Too Many Requests: Rate limit quota exceeded (wait 60 seconds).',
          '500 Internal Server Error: System error; check status.froncort.ai.',
        ],
      },
    ],
    bestPractices: [
      'Store API Bearer tokens securely in environment variables.',
      'Implement exponential backoff when handling 429 rate limit responses.',
    ],
    tips: [
      'Use the interactive API Explorer on this page to test requests in real time!',
    ],
    commonMistakes: [
      'Hardcoding API keys inside client-side bundles.',
    ],
    notes: [
      'API rate limits are enforced per API key (1,000 requests per minute).',
    ],
    relatedSlugs: ['webhooks', 'authentication', 'security'],
  },

  webhooks: {
    slug: 'webhooks',
    title: 'Webhooks & Event Subscriptions',
    subtitle: 'Subscribe to real-time events, verify signatures, and handle retries.',
    category: 'Developer & API',
    categoryOrder: 5,
    iconName: 'Webhook',
    readingTime: '6 min read',
    lastUpdated: 'July 2026',
    summary: 'Receive real-time event notifications for tickets, pull requests, and security alerts.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'signature-verification', title: 'HMAC Signature Verification', level: 2 },
      { id: 'payload-schema', title: 'Webhook Payload Schema', level: 2 },
    ],
    overview:
      'Webhooks allow external applications to receive real-time HTTP POST notifications whenever events happen inside your Froncort organization.',
    concept:
      'Every webhook payload includes an HMAC-SHA256 signature header (x-froncort-signature) computed using your secret webhook key.',
    features: [
      'Event Subscriptions (ticket.created, pr.merged, digest.completed)',
      'Cryptographic HMAC Signature Validation',
      'Automatic Exponential Retry Strategy (up to 5 attempts)',
      'Webhook Delivery History & Log Inspection',
    ],
    sections: [
      {
        id: 'signature-verification',
        title: 'HMAC Signature Verification',
        content: 'Verify webhook authenticity in Node.js / Express:',
        codeSnippet: {
          language: 'typescript',
          filename: 'verify-webhook.ts',
          code: `import crypto from 'crypto';

function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const expectedSignature = \`sha256=\${hmac}\`;
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signatureHeader)
  );
}`,
        },
      },
    ],
    bestPractices: [
      'Always respond to webhook HTTP POST requests with a 200 OK within 5 seconds.',
    ],
    tips: [
      'Use ngrok or Webhook.site for testing local webhook implementations.',
    ],
    commonMistakes: [
      'Parsing JSON body before calculating HMAC signature (must use raw rawBody string).',
    ],
    notes: [
      'Webhooks that fail 5 consecutive times will be temporarily paused.',
    ],
    relatedSlugs: ['api', 'security', 'notifications'],
  },

  deployment: {
    slug: 'deployment',
    title: 'Deployment & Infrastructure Guide',
    subtitle: 'Step-by-step production deployment using Vercel, Neon PostgreSQL, Upstash Redis, and Prisma.',
    category: 'Operations',
    categoryOrder: 6,
    iconName: 'Server',
    readingTime: '9 min read',
    lastUpdated: 'July 2026',
    summary: 'Deploy Froncort to production hosting with serverless database and Redis caching.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'environment-variables', title: 'Environment Variables Setup', level: 2 },
      { id: 'database-migration', title: 'Prisma Migration & Neon Database', level: 2 },
      { id: 'vercel-deployment', title: 'Vercel Deployment Guide', level: 2 },
      { id: 'production-checklist', title: 'Production Security Checklist', level: 2 },
    ],
    overview:
      'This guide provides step-by-step instructions to deploy Froncort to cloud infrastructure using Next.js 15 App Router, Vercel Serverless Functions, Neon Serverless PostgreSQL, and Upstash Serverless Redis.',
    concept:
      'The architecture is completely serverless-ready, allowing instant horizontal scaling and zero-downtime deployments.',
    features: [
      'Vercel Next.js 15 Optimization',
      'Neon PostgreSQL Serverless Branching & Connection Pooling',
      'Upstash Redis Key-Value Store for Rate Limiting & Queues',
      'Prisma Schema Migration Workflows',
      'Automated Health Checks & Telemetry',
    ],
    sections: [
      {
        id: 'environment-variables',
        title: 'Environment Variables Setup',
        content: 'Configure required environment variables in Vercel project settings:',
        codeSnippet: {
          language: 'bash',
          filename: '.env.production',
          code: `# Database & Connection Pooling
DATABASE_URL="postgresql://user:pass@ep-cool-neon.us-east-1.aws.neon.tech/froncort?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-cool-neon.us-east-1.aws.neon.tech/froncort?sslmode=require"

# Redis Cache & Queues
REDIS_URL="rediss://default:token@upstash.io:6379"

# Authentication & JWT
JWT_SECRET="super-secret-random-32-character-key"
NEXTAUTH_URL="https://app.yourdomain.com"

# AI Provider Keys
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"`,
        },
      },
      {
        id: 'database-migration',
        title: 'Prisma Migration & Neon Database',
        content: 'Execute database schema migration prior to deployment:',
        codeSnippet: {
          language: 'bash',
          filename: 'deploy-db.sh',
          code: `# Generate Prisma Client
npx prisma generate

# Apply pending schema migrations
npx prisma migrate deploy

# Seed initial system roles (optional)
npx tsx prisma/seed.ts`,
        },
      },
    ],
    bestPractices: [
      'Use DIRECT_URL for Prisma migrations and DATABASE_URL (pooled) for runtime queries.',
      'Always set NODE_ENV=production in live hosting environments.',
    ],
    tips: [
      'Enable Vercel Analytics and Speed Insights for real-time monitoring.',
    ],
    commonMistakes: [
      'Exposing database secret credentials in public GitHub repositories.',
    ],
    notes: [
      'Neon PostgreSQL automatically scales database compute up and down based on demand.',
    ],
    relatedSlugs: ['api', 'security', 'changelog'],
  },

  faq: {
    slug: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    subtitle: 'Quick answers to common questions about workspace setup, RBAC, tenant isolation, and AI digests.',
    category: 'Overview',
    categoryOrder: 1,
    iconName: 'HelpCircle',
    readingTime: '6 min read',
    lastUpdated: 'July 2026',
    summary: 'Find answers to frequently asked administrative, developer, and security questions.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'search-faq', title: 'Categorized FAQ List', level: 2 },
    ],
    overview:
      'Welcome to the Froncort Documentation FAQ. Browse commonly asked questions below or use the category filter buttons to jump directly to specific topics.',
    concept:
      'This FAQ covers setup, security, AI features, multi-tenancy, and integration topics.',
    features: [
      'Searchable Q&A Directory',
      'Categorized Filters (General, Orgs, Security, AI, Billing)',
      'Expandable Accordion Cards',
    ],
    sections: [],
    bestPractices: [
      'Check the FAQ before opening support tickets to find instant solutions.',
    ],
    tips: [
      'Use the search bar at the top of the FAQ page to filter questions dynamically.',
    ],
    commonMistakes: [],
    notes: [
      'If your question is not listed, contact enterprise support at support@froncort.ai.',
    ],
    relatedSlugs: ['getting-started', 'authentication', 'security'],
  },

  changelog: {
    slug: 'changelog',
    title: 'Product Changelog & Updates',
    subtitle: 'Version history, release notes, new feature announcements, and performance improvements.',
    category: 'Overview',
    categoryOrder: 1,
    iconName: 'History',
    readingTime: '5 min read',
    lastUpdated: 'July 2026',
    summary: 'Stay up to date with new features, security fixes, and performance updates.',
    toc: [
      { id: 'overview', title: 'Overview', level: 2 },
      { id: 'timeline', title: 'Release Timeline', level: 2 },
    ],
    overview:
      'The Froncort Changelog tracks all platform releases, minor updates, security patches, and framework enhancements.',
    concept:
      'Releases follow Semantic Versioning (MAJOR.MINOR.PATCH).',
    features: [
      'Chronological Version History',
      'Feature, Security, and Fix Badges',
      'Detailed Update Descriptions',
    ],
    sections: [],
    bestPractices: [
      'Subscribe to the RSS feed or inspect the Changelog weekly for new features.',
    ],
    tips: [
      'Click on version tags to jump directly to specific release notes.',
    ],
    commonMistakes: [],
    notes: [
      'Past releases remain archived for historical auditing.',
    ],
    relatedSlugs: ['getting-started', 'deployment', 'faq'],
  },
};

export const API_ENDPOINTS_SPEC: ApiEndpointSpec[] = [
  {
    id: 'get-organizations',
    name: 'List Organizations',
    method: 'GET',
    path: '/api/organizations',
    description: 'Retrieve all organizations accessible by the current authenticated user.',
    authRequired: true,
    headers: [
      { key: 'Authorization', value: 'Bearer froncort_pat_xxx', required: true, description: 'JWT or Personal Access Token' },
    ],
    responses: [
      {
        status: 200,
        description: 'Successfully fetched user organizations.',
        sampleJson: JSON.stringify(
          {
            success: true,
            organizations: [
              {
                id: 'org_acme_01',
                name: 'Acme Enterprise',
                slug: 'acme-enterprise',
                role: 'OWNER',
                membersCount: 14,
                createdAt: '2026-01-15T08:00:00.000Z',
              },
              {
                id: 'org_dev_02',
                name: 'DevOps & AI Team',
                slug: 'devops-ai-team',
                role: 'ADMIN',
                membersCount: 6,
                createdAt: '2026-03-20T10:30:00.000Z',
              },
            ],
          },
          null,
          2
        ),
      },
      {
        status: 401,
        description: 'Authentication token missing or invalid.',
        sampleJson: JSON.stringify({ success: false, error: 'Unauthorized: Invalid token' }, null, 2),
      },
    ],
    codeSamples: {
      typescript: `const response = await fetch('https://app.froncort.ai/api/organizations', {
  headers: {
    'Authorization': 'Bearer ' + token,
  },
});
const data = await response.json();`,
      javascript: `axios.get('https://app.froncort.ai/api/organizations', {
  headers: { 'Authorization': \`Bearer \${token}\` }
}).then(res => console.log(res.data));`,
      curl: `curl -X GET "https://app.froncort.ai/api/organizations" \\
  -H "Authorization: Bearer froncort_pat_123456"`,
      serverActions: `'use server';

export async function getUserOrganizations() {
  const res = await fetch('https://app.froncort.ai/api/organizations', {
    headers: { Authorization: \`Bearer \${process.env.FRONCORT_API_KEY}\` },
    next: { revalidate: 60 },
  });
  return res.json();
}`,
    },
  },

  {
    id: 'create-ticket',
    name: 'Create Ticket',
    method: 'POST',
    path: '/api/tickets',
    description: 'Create a new ticket issue within the active organization workspace.',
    authRequired: true,
    headers: [
      { key: 'Authorization', value: 'Bearer froncort_pat_xxx', required: true, description: 'User Bearer Token' },
      { key: 'x-organization-id', value: 'org_acme_01', required: true, description: 'Target Organization ID' },
      { key: 'Content-Type', value: 'application/json', required: true, description: 'Must be application/json' },
    ],
    requestBody: {
      schemaDescription: 'JSON object with ticket details.',
      sampleJson: JSON.stringify(
        {
          title: 'Implement OAuth 2.0 PKCE Flow',
          description: 'Add support for PKCE in mobile authentication client.',
          priority: 'HIGH',
          status: 'TODO',
          tags: ['security', 'auth'],
        },
        null,
        2
      ),
    },
    responses: [
      {
        status: 201,
        description: 'Ticket created successfully.',
        sampleJson: JSON.stringify(
          {
            success: true,
            ticket: {
              id: 'tkt_98765',
              title: 'Implement OAuth 2.0 PKCE Flow',
              status: 'TODO',
              priority: 'HIGH',
              organizationId: 'org_acme_01',
              createdAt: '2026-07-29T12:00:00.000Z',
            },
          },
          null,
          2
        ),
      },
    ],
    codeSamples: {
      typescript: `const response = await fetch('https://app.froncort.ai/api/tickets', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'x-organization-id': 'org_acme_01',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Implement OAuth 2.0 PKCE Flow',
    priority: 'HIGH',
    status: 'TODO',
  }),
});
const data = await response.json();`,
      javascript: `axios.post('https://app.froncort.ai/api/tickets', {
  title: 'Implement OAuth 2.0 PKCE Flow',
  priority: 'HIGH',
}, {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'x-organization-id': 'org_acme_01'
  }
});`,
      curl: `curl -X POST "https://app.froncort.ai/api/tickets" \\
  -H "Authorization: Bearer froncort_pat_123" \\
  -H "x-organization-id: org_acme_01" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Implement PKCE","priority":"HIGH"}'`,
      serverActions: `'use server';

export async function createTicketAction(formData: FormData) {
  const res = await fetch('https://app.froncort.ai/api/tickets', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.FRONCORT_API_KEY}\`,
      'x-organization-id': 'org_acme_01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: formData.get('title'),
      priority: 'HIGH',
    }),
  });
  return res.json();
}`,
    },
  },

  {
    id: 'get-pull-requests',
    name: 'Get Pull Requests',
    method: 'GET',
    path: '/api/pull-requests',
    description: 'Fetch aggregated code review pull requests for an organization.',
    authRequired: true,
    headers: [
      { key: 'Authorization', value: 'Bearer froncort_pat_xxx', required: true, description: 'Token' },
      { key: 'x-organization-id', value: 'org_acme_01', required: true, description: 'Organization Tenant ID' },
    ],
    responses: [
      {
        status: 200,
        description: 'Returns array of pull requests.',
        sampleJson: JSON.stringify(
          {
            success: true,
            pullRequests: [
              {
                id: 'pr_102',
                number: 42,
                title: 'feat: add Gemini 1.5 Pro AI summarizer',
                author: 'sarah.connor',
                status: 'OPEN',
                additions: 340,
                deletions: 42,
                createdAt: '2026-07-28T14:22:00.000Z',
              },
            ],
          },
          null,
          2
        ),
      },
    ],
    codeSamples: {
      typescript: `const response = await fetch('https://app.froncort.ai/api/pull-requests', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'x-organization-id': 'org_acme_01',
  },
});
const data = await response.json();`,
      javascript: `axios.get('https://app.froncort.ai/api/pull-requests', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'x-organization-id': 'org_acme_01'
  }
});`,
      curl: `curl -X GET "https://app.froncort.ai/api/pull-requests" \\
  -H "Authorization: Bearer froncort_pat_123" \\
  -H "x-organization-id: org_acme_01"`,
      serverActions: `'use server';

export async function fetchPullRequests() {
  const res = await fetch('https://app.froncort.ai/api/pull-requests', {
    headers: {
      Authorization: \`Bearer \${process.env.FRONCORT_API_KEY}\`,
      'x-organization-id': 'org_acme_01',
    },
  });
  return res.json();
}`,
    },
  },

  {
    id: 'trigger-digest',
    name: 'Generate AI Digest',
    method: 'POST',
    path: '/api/digest',
    description: 'Trigger asynchronous background generation of an Executive AI Digest.',
    authRequired: true,
    headers: [
      { key: 'Authorization', value: 'Bearer froncort_pat_xxx', required: true, description: 'Admin Bearer Token' },
      { key: 'x-organization-id', value: 'org_acme_01', required: true, description: 'Organization Tenant ID' },
      { key: 'Content-Type', value: 'application/json', required: true, description: 'JSON Content Type' },
    ],
    requestBody: {
      schemaDescription: 'Parameters for digest generation.',
      sampleJson: JSON.stringify(
        {
          timeframe: 'WEEKLY',
          includePrs: true,
          includeTickets: true,
          customInstructions: 'Summarize security audit findings and sprint blockers.',
        },
        null,
        2
      ),
    },
    responses: [
      {
        status: 202,
        description: 'AI Digest job enqueued into Redis background worker queue.',
        sampleJson: JSON.stringify(
          {
            success: true,
            jobId: 'job_digest_77382',
            status: 'QUEUED',
            estimatedTimeSeconds: 15,
          },
          null,
          2
        ),
      },
    ],
    codeSamples: {
      typescript: `const response = await fetch('https://app.froncort.ai/api/digest', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'x-organization-id': 'org_acme_01',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    timeframe: 'WEEKLY',
    includePrs: true,
  }),
});
const data = await response.json();`,
      javascript: `axios.post('https://app.froncort.ai/api/digest', {
  timeframe: 'WEEKLY'
}, {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'x-organization-id': 'org_acme_01'
  }
});`,
      curl: `curl -X POST "https://app.froncort.ai/api/digest" \\
  -H "Authorization: Bearer froncort_pat_123" \\
  -H "x-organization-id: org_acme_01" \\
  -H "Content-Type: application/json" \\
  -d '{"timeframe":"WEEKLY"}'`,
      serverActions: `'use server';

export async function generateDigest() {
  const res = await fetch('https://app.froncort.ai/api/digest', {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${process.env.FRONCORT_API_KEY}\`,
      'x-organization-id': 'org_acme_01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timeframe: 'WEEKLY' }),
  });
  return res.json();
}`,
    },
  },

  {
    id: 'get-notifications',
    name: 'Get Notifications',
    method: 'GET',
    path: '/api/notifications',
    description: 'Fetch real-time notifications and alerts for the current user session.',
    authRequired: true,
    headers: [
      { key: 'Authorization', value: 'Bearer froncort_pat_xxx', required: true, description: 'User Bearer Token' },
      { key: 'x-organization-id', value: 'org_acme_01', required: true, description: 'Organization ID' },
    ],
    responses: [
      {
        status: 200,
        description: 'Successfully retrieved user notifications.',
        sampleJson: JSON.stringify(
          {
            success: true,
            unreadCount: 2,
            notifications: [
              {
                id: 'notif_01',
                type: 'PR_MENTION',
                title: 'You were mentioned on PR #42',
                message: 'Sarah tagged you in a comment on feat: add Gemini 1.5 Pro AI summarizer.',
                read: false,
                createdAt: '2026-07-29T11:45:00.000Z',
              },
              {
                id: 'notif_02',
                type: 'DIGEST_READY',
                title: 'Weekly Executive Digest Ready',
                message: 'Your AI Digest for Acme Enterprise has finished processing.',
                read: false,
                createdAt: '2026-07-29T10:00:00.000Z',
              },
            ],
          },
          null,
          2
        ),
      },
    ],
    codeSamples: {
      typescript: `const response = await fetch('https://app.froncort.ai/api/notifications', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'x-organization-id': 'org_acme_01',
  },
});
const data = await response.json();`,
      javascript: `axios.get('https://app.froncort.ai/api/notifications', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'x-organization-id': 'org_acme_01'
  }
});`,
      curl: `curl -X GET "https://app.froncort.ai/api/notifications" \\
  -H "Authorization: Bearer froncort_pat_123" \\
  -H "x-organization-id: org_acme_01"`,
      serverActions: `'use server';

export async function fetchNotifications() {
  const res = await fetch('https://app.froncort.ai/api/notifications', {
    headers: {
      Authorization: \`Bearer \${process.env.FRONCORT_API_KEY}\`,
      'x-organization-id': 'org_acme_01',
    },
  });
  return res.json();
}`,
    },
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Organizations & Access',
    question: 'How do I create a new organization?',
    answer:
      'You can create a new organization directly from the Organization Switcher in the top navigation bar. Click on your active organization name, select "+ Create Organization", enter your desired organization name and custom URL slug, and click Save. You will automatically be assigned the Owner role.',
    tags: ['organization', 'setup', 'owner'],
  },
  {
    id: 'faq-2',
    category: 'Organizations & Access',
    question: 'How do team invitations work?',
    answer:
      'Organization Admins and Owners can invite team members under Organization Settings > Members. Enter the invitee’s work email address and select their starting role (Admin, Member, or Viewer). An invitation email containing a secure single-use token will be sent instantly.',
    tags: ['invitations', 'members', 'roles'],
  },
  {
    id: 'faq-3',
    category: 'Security & Compliance',
    question: 'How does Role-Based Access Control (RBAC) work?',
    answer:
      'RBAC restricts actions based on user roles within an organization. Owners have full administrative rights including billing and org deletion. Admins manage members, feature flags, and settings. Members manage daily tickets and PRs. Viewers have read-only access.',
    tags: ['rbac', 'security', 'permissions'],
  },
  {
    id: 'faq-4',
    category: 'Security & Compliance',
    question: 'How is tenant isolation enforced across customer data?',
    answer:
      'Froncort uses strict row-level security in PostgreSQL. Every database table includes an organizationId foreign key indexed at the database engine level. Prisma middleware automatically appends tenant context filters to every query, preventing cross-tenant data leaks.',
    tags: ['multi-tenant', 'isolation', 'security'],
  },
  {
    id: 'faq-5',
    category: 'AI Workspace',
    question: 'How do AI Executive Digests work?',
    answer:
      'AI Digests collect telemetry across tickets, pull requests, and audit logs within your selected timeframe (daily or weekly). Data is sanitized, formatted into structured prompts, and evaluated via Google Gemini AI models running on asynchronous Redis background queues.',
    tags: ['ai', 'digest', 'gemini'],
  },
  {
    id: 'faq-6',
    category: 'General',
    question: 'How do I reset my password?',
    answer:
      'Click "Forgot Password?" on the login page at /forgot-password. Enter your account email address to receive a password reset link valid for 1 hour. Follow the instructions to choose a new password.',
    tags: ['password', 'auth', 'account'],
  },
  {
    id: 'faq-7',
    category: 'General',
    question: 'How do feature flags work?',
    answer:
      'Feature Flags allow administrators to toggle platform features on or off in real time without redeploying code. Rules are evaluated in under 2ms using serverless Redis caching and can target specific roles, email domains, or percentage cohorts.',
    tags: ['feature-flags', 'toggles', 'release'],
  },
  {
    id: 'faq-8',
    category: 'General',
    question: 'How do notifications work?',
    answer:
      'In-app notifications appear via the bell icon in the top header when you are assigned tickets, tagged in PR comments, or when an AI Digest completes. You can customize email and push notifications under Account Preferences.',
    tags: ['notifications', 'alerts', 'bell'],
  },
  {
    id: 'faq-9',
    category: 'Billing & Infrastructure',
    question: 'How can I export reports and audit logs?',
    answer:
      'Navigate to the Audit Trail or Analytics section and click "Export Report". You can export data in CSV, JSON, or formatted PDF formats. Audit exports include cryptographic verification hashes for compliance.',
    tags: ['export', 'audit', 'analytics', 'reports'],
  },
];

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: 'v1.2.0',
    date: 'July 28, 2026',
    title: 'AI Digest Enhancements & Security Dashboard 2.0',
    badgeText: 'Latest Release',
    badgeVariant: 'primary',
    description: 'Major update introducing Google Gemini 1.5/3.6 Flash model support, real-time security revocation tracking, and upgraded documentation center.',
    highlights: [
      {
        type: 'feature',
        title: 'Google Gemini 3.6 Flash Integration',
        description: 'Executive digests generate 3x faster with enhanced token compression and custom prompt templates.',
      },
      {
        type: 'security',
        title: 'Session Revocation Dashboard',
        description: 'Admins can inspect active sessions globally and trigger one-click remote session invalidation.',
      },
      {
        type: 'performance',
        title: 'Redis Query Caching',
        description: 'Reduced average API response latency by 45% for high-frequency organization switcher calls.',
      },
      {
        type: 'fix',
        title: 'Kanban Board Drag-and-Drop Fix',
        description: 'Resolved intermittent status update race condition on mobile devices.',
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'June 15, 2026',
    title: 'Knowledge Graph Visualizer & Dynamic Feature Flags',
    badgeText: 'Major Update',
    badgeVariant: 'success',
    description: 'Added interactive entity graph mapping tickets, PRs, and team members alongside dynamic targeting feature flags.',
    highlights: [
      {
        type: 'feature',
        title: 'Interactive Knowledge Graph',
        description: 'Explore visual topological webs connecting PRs, tickets, and team members with zoom & pan controls.',
      },
      {
        type: 'feature',
        title: 'Dynamic Percentage Feature Flags',
        description: 'Roll out new features gradually to 10%, 25%, or 50% user cohorts with instant kill switches.',
      },
      {
        type: 'security',
        title: 'Immutable Audit Export Hashes',
        description: 'Audit logs now feature SHA-256 integrity verification hashes for compliance auditors.',
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'May 01, 2026',
    title: 'Initial General Availability (GA)',
    badgeText: 'GA Release',
    badgeVariant: 'info',
    description: 'First public production release of Froncort Enterprise Workspace.',
    highlights: [
      {
        type: 'feature',
        title: 'Multi-Tenant Workspaces & RBAC',
        description: 'Complete organization switching, role-based access control (Owner, Admin, Member, Viewer).',
      },
      {
        type: 'feature',
        title: 'Unified Tickets & PR Tracking',
        description: 'Kanban boards, list views, and pull request review aggregation.',
      },
    ],
  },
];

export function getDocArticle(slug: string): DocArticle | undefined {
  return DOCS_ARTICLES[slug];
}

export function getAllDocArticles(): DocArticle[] {
  return Object.values(DOCS_ARTICLES);
}
