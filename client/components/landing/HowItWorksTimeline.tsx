'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Building2,
  Ticket,
  GitPullRequest,
  ShieldCheck,
  Share2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const HowItWorksTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Authenticate',
      subtitle: 'Secure OAuth2 / JWT Identity',
      desc: 'Users authenticate into their organizational tenant context. Multi-factor auth and active sessions are validated in real time.',
      icon: KeyRound,
      badge: 'JWT Auth',
    },
    {
      num: '02',
      title: 'Switch Organization',
      subtitle: 'Multi-Tenant Context Switch',
      desc: 'Seamlessly switch active workspace contexts without re-authentication. RBAC roles dynamically re-evaluate for each tenant.',
      icon: Building2,
      badge: 'Tenant Isolation',
    },
    {
      num: '03',
      title: 'Create Ticket',
      subtitle: 'Omnichannel Ingress',
      desc: 'Log customer issues, assign priority matrix scores, track SLA timers, and link relevant repositories or tickets.',
      icon: Ticket,
      badge: 'Support Hub',
    },
    {
      num: '04',
      title: 'Review Code & Workflows',
      subtitle: 'Multi-Party Approvals',
      desc: 'Submit pull requests, perform visual diff inspections, leave inline comments, and satisfy required approval thresholds.',
      icon: GitPullRequest,
      badge: 'Review Console',
    },
    {
      num: '05',
      title: 'Audit & Compliance Stream',
      desc: 'Every state mutation and approval event is immutably logged with before/after state diff payloads.',
      icon: ShieldCheck,
      badge: 'Audit Viewer',
    },
    {
      num: '06',
      title: 'Collaborate Across Orgs',
      subtitle: 'Federated Resource Access',
      desc: 'Share tickets or review requests with external partner organizations under strict time-bound permissions.',
      icon: Share2,
      badge: 'Cross Sharing',
    },
    {
      num: '07',
      title: 'AI Insights Generation',
      subtitle: 'Executive Digest',
      desc: 'Background workers aggregate activity logs and synthesize key highlights, open blockers, and security alerts.',
      icon: Sparkles,
      badge: 'Gemini LLM',
    },
  ];

  return (
    <section className="py-20 border-b border-[#D9D9D9] bg-[#F2F2F2] relative text-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#D9D9D9] bg-white text-[#174D38] text-xs font-mono font-medium shadow-xs">
            Execution Lifecycle
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1F1F1F] tracking-tight">
            How The Workspace Operates
          </h2>
          <p className="text-xs md:text-sm text-[#6B7280]">
            A step-by-step walk-through of the end-to-end user lifecycle inside Unified Organization Workspace.
          </p>
        </div>

        {/* Horizontal Stepper Selector */}
        <div className="flex items-center justify-between overflow-x-auto pb-4 border-b border-[#D9D9D9] no-scrollbar gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-md text-xs font-mono font-medium transition-all shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-[#174D38] text-white border-[#174D38] shadow-xs'
                    : 'bg-white text-[#1F1F1F] border-[#D9D9D9] hover:bg-[#F2F2F2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.num}</span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Step Display Card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-[10px] border border-[#D9D9D9] bg-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs"
        >
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-mono font-semibold text-[#174D38]">
                STEP {steps[activeStep].num}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F2F2F2] text-[#1F1F1F] border border-[#D9D9D9]">
                {steps[activeStep].badge}
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-[#1F1F1F] tracking-tight">
              {steps[activeStep].title}
            </h3>

            <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed">
              {steps[activeStep].desc}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#15803D]">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              <span>Automated Tenant Validation Active</span>
            </div>
          </div>

          <div className="lg:col-span-5 p-5 rounded-md border border-[#D9D9D9] bg-[#F2F2F2]/50 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] border-b border-[#D9D9D9] pb-2">
              <span>SYSTEM EVENT STREAM</span>
              <span className="text-[#15803D] font-semibold">SUCCESS</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <p className="text-[#1F1F1F]">
                <span className="text-[#174D38]">&gt; event:</span> {steps[activeStep].title.toUpperCase().replace(/\s+/g, '_')}
              </p>
              <p className="text-[#1F1F1F]">
                <span className="text-[#6B7280]">&gt; tenant:</span> org_acme_enterprise
              </p>
              <p className="text-[#1F1F1F]">
                <span className="text-[#15803D]">&gt; status:</span> 200 OK (latency: 14ms)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
