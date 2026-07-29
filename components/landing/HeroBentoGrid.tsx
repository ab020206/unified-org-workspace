'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  GitPullRequest,
  Ticket,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Check,
  TrendingUp,
} from 'lucide-react';

import {
  heroHeadline,
  heroSubtitle,
  staggerContainer,
  bentoCardItem,
  cardHoverProps,
  buttonMotionProps,
} from '@/lib/motion';

export const HeroBentoGrid: React.FC = () => {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden z-10 bg-background text-text-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* ================================================== */}
          {/* LEFT SIDE: Hero Copy & Calls to Action (~35%)       */}
          {/* ================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-center py-2 lg:py-4 space-y-8">
            <div className="space-y-5">
              {/* Small Label */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface text-text-primary text-xs font-sans font-medium shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>Enterprise Collaboration Platform</span>
                </div>
              </motion.div>

              {/* Headline (700ms duration fade + upward reveal) */}
              <motion.h1
                variants={heroHeadline}
                initial="hidden"
                animate="visible"
                className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-text-primary leading-[1.15]"
              >
                One Workspace for Reviews, Support, Security and AI.
              </motion.h1>

              {/* Supporting Paragraph (Fade after headline) */}
              <motion.p
                variants={heroSubtitle}
                initial="hidden"
                animate="visible"
                className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl"
              >
                Manage support tickets, code reviews, audit logs, organization collaboration, and
                AI-powered insights from a single secure multi-tenant workspace.
              </motion.p>

              {/* CTAs (Button hover lift & tap feedback) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex flex-wrap items-center gap-3.5 pt-2"
              >
                <motion.div {...buttonMotionProps}>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 rounded-md text-xs font-medium text-primary-foreground bg-primary hover:bg-primary-hover shadow-xs inline-flex items-center gap-2"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>

                <motion.div {...buttonMotionProps}>
                  <Link
                    href="/docs"
                    className="px-5 py-2.5 rounded-md text-xs font-medium text-text-primary bg-surface hover:bg-surface-secondary border border-border inline-flex items-center gap-2 shadow-xs"
                  >
                    <span>View Documentation</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-6 border-t border-border grid grid-cols-2 gap-3 text-xs font-sans text-text-secondary"
            >
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-text-primary font-medium">Multi Tenant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-text-primary font-medium">RBAC Controls</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-text-primary font-medium">AI Digests</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-text-primary font-medium">Enterprise Security</span>
              </div>
            </motion.div>
          </div>

          {/* ================================================== */}
          {/* RIGHT SIDE: Staggered Bento Cards (50ms Stagger)  */}
          {/* ================================================== */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-3.5"
          >
            {/* Card 1: AI Digest */}
            <motion.div
              variants={bentoCardItem}
              {...cardHoverProps}
              className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-secondary border border-border flex items-center justify-center text-primary">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-xs text-text-primary">AI Digest</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-surface-secondary text-primary border border-border">
                  Daily Briefing
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 rounded bg-surface-secondary/50 border border-border">
                  <div className="text-xl font-bold font-sans text-text-primary">8</div>
                  <div className="text-[9px] text-text-secondary font-sans font-medium">
                    PRs Reviewed
                  </div>
                </div>
                <div className="p-2 rounded bg-surface-secondary/50 border border-border">
                  <div className="text-xl font-bold font-sans text-text-primary">3</div>
                  <div className="text-[9px] text-text-secondary font-sans font-medium">
                    High Tickets
                  </div>
                </div>
                <div className="p-2 rounded bg-surface-secondary/50 border border-border">
                  <div className="text-xl font-bold font-sans text-primary">98.4%</div>
                  <div className="text-[9px] text-text-secondary font-sans font-medium">
                    AI Confidence
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-sans text-text-secondary pt-1 border-t border-border">
                <span className="text-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Compliant
                </span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  <TrendingUp className="w-3 h-3" /> +14% Efficiency
                </span>
              </div>
            </motion.div>

            {/* Card 2: Review Queue */}
            <motion.div
              variants={bentoCardItem}
              {...cardHoverProps}
              className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-secondary border border-border flex items-center justify-center text-primary">
                    <GitPullRequest className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-xs text-text-primary">Review Queue</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-surface-secondary text-text-primary border border-border">
                  2 Pending
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[10px] text-primary font-bold">PR-402</span>
                    <p className="text-[11px] font-medium text-text-primary truncate">
                      RSA-256 Verification
                    </p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-success/10 text-success border border-success/20 shrink-0">
                    2/2 Approved
                  </span>
                </div>

                <div className="p-2 rounded border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[10px] text-primary font-bold">PR-405</span>
                    <p className="text-[11px] font-medium text-text-primary truncate">
                      Redis Pool Limits
                    </p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-warning/10 text-warning border border-warning/20 shrink-0">
                    1/2 Pending
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-sans text-text-secondary pt-1 border-t border-border">
                <span>Branch Policy Active</span>
                <span className="text-primary font-semibold">Merge Ready</span>
              </div>
            </motion.div>

            {/* Card 3: Support Hub */}
            <motion.div
              variants={bentoCardItem}
              {...cardHoverProps}
              className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-secondary border border-border flex items-center justify-center text-primary">
                    <Ticket className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-xs text-text-primary">Support Hub</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-surface-secondary text-success border border-border">
                  SLA 99.8%
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[10px] text-primary font-bold">TICK-1089</span>
                    <p className="text-[11px] font-medium text-text-primary truncate">
                      SOC2 Expiration Rule
                    </p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-error/10 text-error border border-error/20 shrink-0">
                    HIGH
                  </span>
                </div>

                <div className="p-2 rounded border border-border bg-surface-secondary/40 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[10px] text-primary font-bold">TICK-1092</span>
                    <p className="text-[11px] font-medium text-text-primary truncate">
                      Redis Limiter Timeout
                    </p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold bg-warning/10 text-warning border border-warning/20 shrink-0">
                    CRITICAL
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-sans text-text-secondary pt-1 border-t border-border">
                <span>Avg Response: 14m</span>
                <span>Queue: 3 Open</span>
              </div>
            </motion.div>

            {/* Card 4: Audit Timeline */}
            <motion.div
              variants={bentoCardItem}
              {...cardHoverProps}
              className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-secondary border border-border flex items-center justify-center text-primary">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-xs text-text-primary">Audit Timeline</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-surface-secondary text-primary border border-border">
                  Tamper-Proof
                </span>
              </div>

              <div className="relative border-l border-border pl-2.5 space-y-2 text-[11px]">
                <div className="relative pl-1">
                  <div className="absolute -left-[14px] top-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  <div className="flex items-center justify-between text-text-primary font-mono text-[10px]">
                    <span className="font-semibold">USER_LOGIN</span>
                    <span className="text-[9px] text-text-secondary">2m ago</span>
                  </div>
                </div>

                <div className="relative pl-1">
                  <div className="absolute -left-[14px] top-1 w-1.5 h-1.5 rounded-full bg-success" />
                  <div className="flex items-center justify-between text-text-primary font-mono text-[10px]">
                    <span className="font-semibold">ROLE_CHANGE</span>
                    <span className="text-[9px] text-text-secondary">12m ago</span>
                  </div>
                </div>

                <div className="relative pl-1">
                  <div className="absolute -left-[14px] top-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  <div className="flex items-center justify-between text-text-primary font-mono text-[10px]">
                    <span className="font-semibold">ORG_SHARED</span>
                    <span className="text-[9px] text-text-secondary">34m ago</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-sans text-text-secondary pt-1 border-t border-border">
                <span className="font-mono">0x8a0...4f9b</span>
                <span className="text-success font-semibold">Verified Log</span>
              </div>
            </motion.div>

            {/* Card 5: Organization Overview (Full Width) */}
            <motion.div
              variants={bentoCardItem}
              {...cardHoverProps}
              className="md:col-span-2 p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-3 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-secondary border border-border flex items-center justify-center text-primary">
                    <Building2 className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-xs text-text-primary">
                    Organization Overview
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-surface-secondary text-success border border-border flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  Audit Healthy
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded bg-surface-secondary/50 border border-border space-y-0.5">
                  <div className="text-[10px] text-text-secondary font-sans font-medium">
                    Active Orgs
                  </div>
                  <div className="text-2xl font-extrabold font-sans text-text-primary tracking-tight">
                    12
                  </div>
                  <div className="text-[9px] text-text-secondary font-sans">Multi-Tenant</div>
                </div>

                <div className="p-2.5 rounded bg-surface-secondary/50 border border-border space-y-0.5">
                  <div className="text-[10px] text-text-secondary font-sans font-medium">
                    Active Users
                  </div>
                  <div className="text-2xl font-extrabold font-sans text-text-primary tracking-tight">
                    1,284
                  </div>
                  <div className="text-[9px] text-text-secondary font-sans">RBAC Enforced</div>
                </div>

                <div className="p-2.5 rounded bg-surface-secondary/50 border border-border space-y-0.5">
                  <div className="text-[10px] text-text-secondary font-sans font-medium">
                    Review Rate
                  </div>
                  <div className="text-2xl font-extrabold font-sans text-primary tracking-tight">
                    94.2%
                  </div>
                  <div className="w-full bg-border h-1 rounded-full overflow-hidden mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '94.2%' }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      className="bg-primary h-full rounded-full"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded bg-surface-secondary/50 border border-border space-y-0.5">
                  <div className="text-[10px] text-text-secondary font-sans font-medium">
                    Security Score
                  </div>
                  <div className="text-2xl font-extrabold font-sans text-success tracking-tight">
                    99/100
                  </div>
                  <div className="text-[9px] text-text-secondary font-sans">SOC2 Compliant</div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface-secondary/30 border border-border text-[11px] font-sans flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-text-primary truncate">
                  <strong className="text-primary font-semibold">AI Insights:</strong> 0
                  cross-tenant anomalies detected in 24h.
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
