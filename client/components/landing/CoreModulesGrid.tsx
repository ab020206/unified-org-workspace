'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Headphones,
  GitPullRequest,
  ShieldCheck,
  Share2,
  Sparkles,
  Bell,
  KeyRound,
  ArrowUpRight,
} from 'lucide-react';

export const CoreModulesGrid: React.FC = () => {
  const modules = [
    {
      icon: Lock,
      title: 'Authentication & Tenant Security',
      desc: 'Multi-tenant isolation backed by JWT session validation, fine-grained Role-Based Access Control (RBAC), and session revocation.',
      tag: 'SECURITY CORE',
      preview: 'JWT + Session Cookies • Tenant Context Isolation',
    },
    {
      icon: Headphones,
      title: 'Omnichannel Support Hub',
      desc: 'High-throughput ticket routing, SLA timers, priority calculation, customer context panels, and internal engineering comments.',
      tag: 'SUPPORT OPS',
      preview: 'Automated Ticket Scoring • Threaded Comments',
    },
    {
      icon: GitPullRequest,
      title: 'Review Console Workflows',
      desc: 'Multi-reviewer authorization thresholds, version diff previews, approval policies, branch policy enforcement, and merge checks.',
      tag: 'ENGINEERING',
      preview: 'Multi-approval Thresholds • Visual Diff Engine',
    },
    {
      icon: ShieldCheck,
      title: 'Immutable Audit Stream',
      desc: 'SOC2 compliant security event recording with JSON state diff comparison, actor tracking, and 365-day tamper-proof retention.',
      tag: 'COMPLIANCE',
      preview: '365-Day Retention • JSON Payload Diffing',
    },
    {
      icon: Share2,
      title: 'Cross-Tenant Resource Sharing',
      desc: 'Federated resource sharing across organization boundaries with explicit permission scopes (READ, REVIEW, APPROVE) and expiration dates.',
      tag: 'FEDERATION',
      preview: 'Granular Scopes • Explicit Expiry Control',
    },
    {
      icon: Sparkles,
      title: 'AI Digest Engine',
      desc: 'Asynchronous LLM worker pipeline synthesizing assigned tickets, open code reviews, and security alerts into concise executive briefings.',
      tag: 'INTELLIGENCE',
      preview: 'Google Gemini Powered • Async Background Summarizer',
    },
    {
      icon: Bell,
      title: 'Real-Time Notification Dispatch',
      desc: 'Granular notification preferences, in-app bell updates, unread indicators, and external webhook integrations for instant alerting.',
      tag: 'NOTIFICATIONS',
      preview: 'WebSockets + Webhook Subscriptions • SLA Alerts',
    },
    {
      icon: KeyRound,
      title: 'Enterprise Feature Governance',
      desc: 'Targeted feature flag evaluation, organization-level toggles, gradual rollout channels, and environment isolation.',
      tag: 'GOVERNANCE',
      preview: 'Org-Scoped Flags • Instant Feature Toggles',
    },
  ];

  return (
    <section id="features" className="py-20 border-b border-[#D9D9D9] bg-[#F2F2F2] relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#D9D9D9] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#D9D9D9] bg-white text-[#174D38] text-xs font-mono font-medium shadow-xs">
              Core Platform Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1F1F1F] tracking-tight">
              Enterprise-Grade Platform Modules
            </h2>
            <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed">
              Eight deeply integrated modules engineered to replace disparate tools with a unified, high-density workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#15803D] shrink-0 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
            <span>All Modules Production Ready</span>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.18, delay: idx * 0.03 }}
                className="group p-5 rounded-[10px] border border-[#D9D9D9] bg-white space-y-4 hover:border-[#174D38]/40 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-md bg-[#F2F2F2] border border-[#D9D9D9] flex items-center justify-center text-[#174D38]">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-[#F2F2F2] text-[#1F1F1F] border border-[#D9D9D9]">
                      {mod.tag}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-[#1F1F1F] group-hover:text-[#174D38] transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                {/* Quick preview pill */}
                <div className="pt-3 border-t border-[#D9D9D9] relative z-10 flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
                  <span className="truncate">{mod.preview}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#6B7280] group-hover:text-[#174D38] transition-colors shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
