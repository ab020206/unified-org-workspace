'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Ticket,
  GitPullRequest,
  Shield,
  Sparkles,
  Bell,
  ChevronDown,
  Building2,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';

export const InteractiveHeroDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'activity' | 'tickets' | 'reviews' | 'ai'>(
    'activity'
  );
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('Acme Enterprise Corp');

  const orgs = ['Acme Enterprise Corp', 'Stripe Inc (Partner)', 'Vercel Dev (Shared)'];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[10px] border border-border bg-surface shadow-xs overflow-hidden font-sans text-xs text-text-primary">
      {/* App Bar Header */}
      <div className="h-11 px-4 border-b border-border bg-surface-secondary flex items-center justify-between">
        {/* Window controls & Org Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 pr-2 border-r border-border">
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
          </div>

          <div className="relative group">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface border border-border text-text-primary font-medium hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-xs">{selectedOrg}</span>
              <ChevronDown className="w-3 h-3 text-text-secondary" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 py-1 rounded-md border border-border bg-surface shadow-xs z-30">
                {orgs.map((org) => (
                  <button
                    key={org}
                    onClick={() => {
                      setSelectedOrg(org);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] font-medium hover:bg-surface-secondary transition-colors cursor-pointer ${
                      selectedOrg === org ? 'text-primary font-semibold' : 'text-text-primary'
                    }`}
                  >
                    {org}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-surface border border-border text-text-secondary w-64">
          <Search className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-[11px]">Search tickets, reviews, audit...</span>
          <kbd className="ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-surface-secondary text-text-secondary border border-border">
            ⌘K
          </kbd>
        </div>

        {/* User Pill & Notifications */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary relative cursor-pointer">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              JD
            </div>
            <span className="hidden md:inline-block font-mono text-[11px] text-text-primary">
              john.doe@acme.com
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Navigation Tabs */}
        <div className="md:col-span-12 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'activity' as const, label: 'Live Stream', icon: Layers, count: '14' },
              { id: 'tickets' as const, label: 'Tickets', icon: Ticket, count: '3' },
              { id: 'reviews' as const, label: 'Code Reviews', icon: GitPullRequest, count: '2' },
              { id: 'ai' as const, label: 'AI Digest', icon: Sparkles, badge: 'Updated' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-xs transition-all relative cursor-pointer ${
                    isActive
                      ? 'text-primary-foreground bg-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                        isActive
                          ? 'bg-primary-dark text-white border-transparent'
                          : 'bg-surface-secondary text-text-secondary border-border'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                        isActive
                          ? 'bg-primary-dark text-white border-transparent'
                          : 'bg-surface-secondary text-primary border-border'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-success font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            <span>Tenant Isolation Active</span>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="md:col-span-8 space-y-3">
          <AnimatePresence mode="wait">
            {activeSubTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="space-y-2.5"
              >
                {/* Event 1 */}
                <div className="p-3 rounded-md border border-border bg-surface-secondary/50 hover:bg-surface-secondary transition-colors flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-surface border border-border text-primary flex items-center justify-center shrink-0">
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary truncate">
                        [TICK-1089] SOC2 Audit Log Expiration Rule Update
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary shrink-0">
                        2m ago
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-1">
                      Assigned to <span className="text-text-primary font-mono">@sarah.eng</span>{' '}
                      with Priority HIGH. Tenant context confirmed.
                    </p>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="p-3 rounded-md border border-border bg-surface-secondary/50 hover:bg-surface-secondary transition-colors flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-surface border border-border text-primary flex items-center justify-center shrink-0">
                    <GitPullRequest className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary truncate">
                        PR #402: Add RSA-256 Signature Verification to Webhooks
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary shrink-0">
                        12m ago
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-1">
                      Approved by <span className="text-text-primary font-mono">@alex.lead</span>{' '}
                      (2/2 Required Reviews Met).
                    </p>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="p-3 rounded-md border border-border bg-surface-secondary/50 hover:bg-surface-secondary transition-colors flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-surface border border-border text-success flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary truncate">
                        Audit Stream: Cross-Tenant Sharing Resource Created
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary shrink-0">
                        34m ago
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-1">
                      Granted <span className="text-success font-mono">READ_REVIEW</span> scope to
                      target organization{' '}
                      <span className="text-text-primary font-mono">org_stripe_prod</span>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'tickets' && (
              <motion.div
                key="tickets"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="space-y-2"
              >
                {[
                  {
                    id: 'TICK-1092',
                    title: 'Implement Redis Rate Limiter Middleware',
                    status: 'IN_PROGRESS',
                    priority: 'HIGH',
                    author: 'DevOps Team',
                  },
                  {
                    id: 'TICK-1088',
                    title: 'Verify JWT Rotation Keys in Staging Cluster',
                    status: 'OPEN',
                    priority: 'CRITICAL',
                    author: 'Security Team',
                  },
                  {
                    id: 'TICK-1085',
                    title: 'Optimize Postgres Partial Indexes for Audit Stream',
                    status: 'COMPLETED',
                    priority: 'MEDIUM',
                    author: 'Backend Engineering',
                  },
                ].map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-md border border-border bg-surface-secondary/50 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-primary font-bold">
                          {ticket.id}
                        </span>
                        <span className="font-medium text-text-primary">{ticket.title}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary">{ticket.author}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface text-text-primary border border-border">
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSubTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="space-y-2"
              >
                {[
                  {
                    id: 'PR-404',
                    title: 'feat(auth): Add RBAC tenant scope validator',
                    author: 'dave.senior',
                    approvals: '2/2 Approved',
                  },
                  {
                    id: 'PR-401',
                    title: 'refactor(db): Migration script for audit payload indexing',
                    author: 'maria.db',
                    approvals: '1/2 Pending',
                  },
                ].map((pr) => (
                  <div
                    key={pr.id}
                    className="p-3 rounded-md border border-border bg-surface-secondary/50 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-primary font-bold">
                          {pr.id}
                        </span>
                        <span className="font-medium text-text-primary">{pr.title}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary">Author: {pr.author}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface text-success border border-border">
                      {pr.approvals}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSubTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="p-3.5 rounded-md border border-border bg-surface space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary font-medium text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Platform Digest</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary">
                    Generated 08:00 AM
                  </span>
                </div>
                <p className="text-[11px] text-text-primary leading-relaxed">
                  &quot;Today&apos;s high-priority operational briefing: 3 active support tickets
                  require SLA response before 14:00. PR #402 is ready for production merge. Security
                  audit stream records 100% compliant cross-tenant requests over the last 24h.&quot;
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Panel Overview */}
        <div className="md:col-span-4 space-y-3 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-medium text-text-secondary uppercase tracking-wider">
              Workspace Overview
            </span>
            <div className="p-3 rounded-md border border-border bg-surface-secondary/50 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-text-secondary">Tenant Status</span>
                <span className="text-success font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Isolated
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-text-secondary">Active Reviewers</span>
                <span className="text-text-primary font-mono">8 Online</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-text-secondary">Audit Stream</span>
                <span className="text-primary font-mono">1,492 events/s</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-medium text-text-secondary uppercase tracking-wider">
              Recent Action Trail
            </span>
            <div className="p-3 rounded-md border border-border bg-surface-secondary/50 space-y-2 font-mono text-[10px]">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Clock className="w-3 h-3 text-text-secondary" />
                <span className="text-text-primary">USER_LOGIN</span>
                <span className="text-text-secondary ml-auto">ip: 192.168.1.1</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Shield className="w-3 h-3 text-success" />
                <span className="text-text-primary">SCOPE_GRANTED</span>
                <span className="text-text-secondary ml-auto">role: ADMIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
