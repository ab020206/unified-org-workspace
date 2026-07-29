'use client';

import React, { useState } from 'react';
import { CommandBar } from '@/components/ui/CommandBar';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState([
    { key: 'AI_DIGEST', desc: 'AI Executive Summary Generator & Digest Engine', enabled: true },
    { key: 'CROSS_ORG_SHARING', desc: 'Cross-Organization Resource & Ticket Sharing', enabled: true },
    { key: 'REVIEW_CONSOLE', desc: 'Code Review Console & Visual Diff Subsystem', enabled: true },
    { key: 'NOTIFICATIONS', desc: 'Real-time WebSocket & Email Notification Engine', enabled: true },
    { key: 'ADVANCED_ANALYTICS', desc: 'Advanced Analytics Dashboard & Throughput Metrics', enabled: true },
  ]);

  const toggleFlag = (key: string) => {
    setFlags(flags.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
  };

  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Platform Feature Flags Control Matrix"
        moduleAccent="security"
        breadcrumbs={['Platform Admin', 'Feature Flags Matrix']}
        searchPlaceholder="Filter feature flags by key or module description..."
        primaryActionLabel="Save Global Flags"
        onPrimaryAction={() => alert('Global feature flags saved successfully!')}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium">
          <ToggleRight className="w-3.5 h-3.5" />
          <span>Global Feature Flags Governance</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">Platform Feature Flags Matrix</h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Control feature availability across all tenant organizations. Toggle experimental features, AI services, and cross-tenant sharing.
        </p>
      </div>

      <div className="p-5 rounded-[10px] border border-border bg-surface space-y-4 shadow-xs">
        <div className="border-b border-border pb-3">
          <h3 className="font-semibold text-sm text-text-primary">Global Feature Toggles</h3>
        </div>

        <div className="space-y-3">
          {flags.map((flag) => (
            <div key={flag.key} className="p-4 rounded-md bg-surface-secondary/50 border border-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-xs text-text-primary font-mono">{flag.key}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-secondary border border-border text-text-primary font-bold">
                    SYSTEM FLAG
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{flag.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleFlag(flag.key)}
                className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  flag.enabled
                    ? 'bg-success/10 border-success/20 text-success font-semibold'
                    : 'bg-surface border-border text-text-secondary font-normal'
                }`}
              >
                {flag.enabled ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-text-secondary" />}
                <span>{flag.enabled ? 'ENABLED' : 'DISABLED'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
