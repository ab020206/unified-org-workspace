'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Headphones,
  GitPullRequest,
  ShieldCheck,
  Cpu,
  Bell,
  Share2,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const WorkflowDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'auth',
      title: 'Authentication & RBAC',
      desc: 'JWT validation, Tenant ID context injection, session cookies.',
      icon: Lock,
    },
    {
      id: 'support',
      title: 'Support Hub Triage',
      desc: 'Omnichannel ticket ingress, priority scoring & SLA tracking.',
      icon: Headphones,
    },
    {
      id: 'review',
      title: 'Review Console Workflows',
      desc: 'Code approvals, inline diff review, versioned branch enforcement.',
      icon: GitPullRequest,
    },
    {
      id: 'audit',
      title: 'Immutable Audit Stream',
      desc: 'Cryptographically signed audit logs with payload state diffs.',
      icon: ShieldCheck,
    },
    {
      id: 'ai',
      title: 'AI Digest Engine',
      desc: 'Async LLM workers synthesizing operational briefings.',
      icon: Cpu,
    },
    {
      id: 'notifications',
      title: 'Real-Time Dispatch',
      desc: 'WebSockets, Slack webhooks, email alerts, in-app notifications.',
      icon: Bell,
    },
    {
      id: 'collaboration',
      title: 'Cross-Tenant Sharing',
      desc: 'Granular resource federation between authorized partner orgs.',
      icon: Share2,
    },
  ];

  return (
    <section className="py-20 border-b border-[#D9D9D9] bg-[#F2F2F2] relative overflow-hidden text-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#D9D9D9] bg-white text-[#174D38] text-xs font-mono font-medium shadow-xs">
            Platform Architecture Flow
          </div>
          <h2 className="text-2xl md:text-4xl font-semibold text-[#1F1F1F] tracking-tight">
            Seamless End-to-End Enterprise Pipeline
          </h2>
          <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed">
            Every request travels through an integrated, audit-ready architecture designed for multi-tenant isolation and security.
          </p>
        </div>

        {/* Diagram Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div key={step.id} className="relative group">
                <motion.div
                  onClick={() => setActiveStep(idx)}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className={`cursor-pointer p-4 rounded-[10px] border text-center space-y-3 transition-all h-full flex flex-col items-center justify-between shadow-xs ${
                    isSelected
                      ? 'border-[#174D38] bg-white ring-1 ring-[#174D38]'
                      : 'border-[#D9D9D9] bg-white hover:bg-[#F2F2F2]/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-medium text-[#6B7280]">0{idx + 1}</span>
                    {isSelected && <CheckCircle className="w-3 h-3 text-[#174D38]" />}
                  </div>

                  <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#F2F2F2] text-[#174D38] border border-[#D9D9D9]">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 w-full">
                    <h3 className="font-semibold text-xs text-[#1F1F1F] line-clamp-1">{step.title}</h3>
                    <p className="text-[10px] text-[#6B7280] line-clamp-2">{step.desc}</p>
                  </div>
                </motion.div>

                {/* Connector Arrow (desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#6B7280]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Step Deep Dive Card */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="p-5 rounded-[10px] border border-[#D9D9D9] bg-white max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F2F2F2] text-[#174D38] border border-[#D9D9D9]">
                STAGE 0{activeStep + 1}
              </span>
              <h4 className="font-semibold text-sm text-[#1F1F1F]">{steps[activeStep].title}</h4>
            </div>
            <p className="text-xs text-[#6B7280]">{steps[activeStep].desc}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#6B7280] shrink-0 border-t md:border-t-0 md:border-l border-[#D9D9D9] pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="block text-[10px] text-[#6B7280]">Latency Overhead</span>
              <span className="text-[#15803D] font-bold">&lt; 2ms</span>
            </div>
            <div>
              <span className="block text-[10px] text-[#6B7280]">Compliance Scope</span>
              <span className="text-[#1F1F1F] font-bold">SOC2 / ISO27001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
