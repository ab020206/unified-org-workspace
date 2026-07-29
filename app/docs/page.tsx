import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Rocket,
  Lock,
  Building2,
  Sparkles,
  Code,
  Server,
  ShieldCheck,
  Network,
  HelpCircle,
  ArrowRight,
  Zap,
  BookOpen,
  CheckCircle,
  FileText,
  Star,
  Clock,
  Terminal,
} from 'lucide-react';
import { DOCS_ARTICLES, CHANGELOG_RELEASES } from '@/lib/docs/docs-data';

export const metadata: Metadata = {
  title: 'Documentation | Froncort Enterprise Platform',
  description: 'Everything you need to build, manage, and secure your enterprise workspace with Froncort.',
  openGraph: {
    title: 'Documentation | Froncort Enterprise Platform',
    description: 'Everything you need to build, manage, and secure your enterprise workspace with Froncort.',
    type: 'website',
  },
};

const FEATURED_CARDS = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    subtitle: 'Quickstart guide to set up your workspace, invite team members, and configure core modules.',
    icon: Rocket,
    category: 'Overview',
    badge: '5 min read',
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    subtitle: 'JWT token lifecycle, session revocation lists, OAuth 2.0 PKCE, and multi-factor security.',
    icon: Lock,
    category: 'Platform Basics',
    badge: '7 min read',
  },
  {
    slug: 'organizations',
    title: 'Organizations',
    subtitle: 'Row-level tenant isolation, multi-tenant switching, and member invitation workflows.',
    icon: Building2,
    category: 'Platform Basics',
    badge: '6 min read',
  },
  {
    slug: 'ai-digest',
    title: 'AI Workspace',
    subtitle: 'Automated executive digests powered by Google Gemini, prompt playground, and token counters.',
    icon: Sparkles,
    category: 'Core Modules',
    badge: '7 min read',
  },
  {
    slug: 'api',
    title: 'API Reference',
    subtitle: 'REST API endpoints, interactive explorer, authorization headers, and code samples.',
    icon: Code,
    category: 'Developer & API',
    badge: '10 min read',
  },
  {
    slug: 'deployment',
    title: 'Deployment',
    subtitle: 'Production infrastructure setup using Vercel Next.js 15, Neon PostgreSQL, and Upstash Redis.',
    icon: Server,
    category: 'Operations',
    badge: '9 min read',
  },
  {
    slug: 'security',
    title: 'Security Architecture',
    subtitle: 'SOC2 compliance, immutable audit logs, rate limiting, and OWASP threat mitigations.',
    icon: ShieldCheck,
    category: 'Enterprise & Security',
    badge: '8 min read',
  },
  {
    slug: 'knowledge-graph',
    title: 'Knowledge Graph',
    subtitle: 'Topological visualizer mapping entity linkages across tickets, PRs, and AI summaries.',
    icon: Network,
    category: 'Core Modules',
    badge: '5 min read',
  },
  {
    slug: 'faq',
    title: 'FAQ Directory',
    subtitle: 'Frequently asked questions covering organization setup, RBAC, tenant isolation, and billing.',
    icon: HelpCircle,
    category: 'Overview',
    badge: '6 min read',
  },
];

const POPULAR_ARTICLES = [
  { slug: 'rbac', title: 'Role-Based Access Control (RBAC)', category: 'Platform Basics' },
  { slug: 'tickets', title: 'Ticket & Issue Tracking', category: 'Core Modules' },
  { slug: 'pull-requests', title: 'Pull Requests & Code Reviews', category: 'Core Modules' },
  { slug: 'feature-flags', title: 'Feature Flags & Controls', category: 'Enterprise & Security' },
  { slug: 'webhooks', title: 'Webhooks & Event Subscriptions', category: 'Developer & API' },
];

const QUICK_LINKS = [
  { label: 'Interactive API Explorer', href: '/docs/api#api-explorer' },
  { label: 'Changelog Timeline', href: '/docs/changelog' },
  { label: 'Environment Setup (.env)', href: '/docs/deployment#environment-variables' },
  { label: 'Tenant Isolation Architecture', href: '/docs/organizations#tenant-isolation' },
];

export default function DocsHomePage() {
  const latestRelease = CHANGELOG_RELEASES[0];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 sm:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Froncort v2.4 Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary font-sans">
            Documentation
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-sans">
            Everything you need to build, manage, and secure your enterprise workspace.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-sans">
            <Link
              href="/docs/getting-started"
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold flex items-center gap-2 shadow-xs transition-transform hover:-translate-y-0.5"
            >
              <span>Quickstart Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/docs/api"
              className="px-5 py-2.5 rounded-lg bg-surface-secondary hover:bg-surface-secondary/80 border border-border text-text-primary font-semibold flex items-center gap-2 transition-colors"
            >
              <Code className="w-4 h-4 text-primary" />
              <span>Explore REST API</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Documentation Bento Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary font-sans">Explore Topics</h2>
          <span className="text-xs font-mono text-text-secondary">9 Core Guides</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_CARDS.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={card.slug}
                href={`/docs/${card.slug}`}
                className="group relative p-6 rounded-xl border border-border bg-surface hover:border-primary/50 card-motion shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-surface-secondary border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-text-secondary">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors font-sans">
                      {card.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Explore Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: Recent Updates, Popular Articles, Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Updates */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary font-sans">Recent Updates</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-primary">{latestRelease.version}</span>
                <span className="text-[10px] text-text-secondary">{latestRelease.date}</span>
              </div>
              <p className="text-xs font-semibold text-text-primary">{latestRelease.title}</p>
              <p className="text-[11px] text-text-secondary line-clamp-2">
                {latestRelease.description}
              </p>
            </div>

            <Link
              href="/docs/changelog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>View Full Changelog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Star className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-text-primary font-sans">Popular Articles</h3>
          </div>

          <div className="space-y-2">
            {POPULAR_ARTICLES.map((art) => (
              <Link
                key={art.slug}
                href={`/docs/${art.slug}`}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-secondary text-xs text-text-primary font-medium transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-muted-text group-hover:text-primary transition-colors shrink-0" />
                  <span className="truncate">{art.title}</span>
                </div>
                <span className="text-[10px] font-mono text-text-secondary shrink-0">
                  {art.category}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Terminal className="w-4 h-4 text-info" />
            <h3 className="text-sm font-bold text-text-primary font-sans">Quick Links</h3>
          </div>

          <div className="space-y-2">
            {QUICK_LINKS.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-secondary/50 hover:bg-surface-secondary border border-border text-xs text-text-primary font-medium transition-colors group"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-text group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
