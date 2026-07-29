'use client';

import React from 'react';
import { CommandBar } from '@/components/ui/CommandBar';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Platform Global Analytics Engine"
        moduleAccent="support"
        breadcrumbs={['Platform Admin', 'Analytics & Metrics Dashboard']}
        searchPlaceholder="Filter analytics by tenant, endpoint, or time range..."
        primaryActionLabel="Export Analytics Report"
        onPrimaryAction={() => alert('Exporting platform analytics dataset...')}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Platform-Wide Throughput Analytics</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">Global Platform Analytics</h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Monitor multi-tenant API request velocity, storage growth, support ticket resolution performance, and code review throughput.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">API Throughput</span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">45,210</p>
          <p className="text-[13px] text-success font-medium">+12% vs last week</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">Storage Consumption</span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">1.24 GB</p>
          <p className="text-[13px] text-text-secondary font-medium">Encrypted Storage</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">Avg SLA Resolution</span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">1.4 hrs</p>
          <p className="text-[13px] text-success font-medium">Support Hub</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-text-secondary uppercase">Review Velocity</span>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">92%</p>
          <p className="text-[13px] text-primary font-medium">PR Approval Rate</p>
        </div>
      </div>
    </div>
  );
}
