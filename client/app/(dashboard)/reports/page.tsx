'use client';

import React from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export default function WorkspaceReportsPage() {
  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Workspace Executive Reports & AI Digest"
        moduleAccent="support"
        breadcrumbs={['Workspace Management', 'Executive Reports']}
        searchPlaceholder="Search executive digests or compliance reports..."
        primaryActionLabel="Generate New AI Digest"
        onPrimaryAction={() => (window.location.href = '/digest')}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Operational Summary Generator</span>
          </div>
          <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">Executive Reports & Operational Digest</h2>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Generate and inspect automated AI digests, SLA compliance metrics, and workspace performance reports.
          </p>
        </div>
        <Link
          href="/digest"
          className="px-4 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs transition-all shadow-xs flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Generate Digest
        </Link>
      </div>

      <div className="p-5 rounded-[10px] border border-border bg-surface space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm text-text-primary border-b border-border pb-3">Available Workspace Reports</h3>

        <div className="space-y-3">
          <div className="p-4 rounded-md bg-surface-secondary/50 border border-border flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-xs text-text-primary">Weekly Support SLA & Ticket Throughput Digest</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success font-bold">
                  READY
                </span>
              </div>
              <p className="text-xs text-text-secondary">20 active support tickets tracked. SLA compliance rate: 96.4% on-time resolution.</p>
            </div>
            <Link
              href="/digest"
              className="px-3 py-1.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-primary text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              View Report <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-md bg-surface-secondary/50 border border-border flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-xs text-text-primary">Code Review & Merge Readiness Summary</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success font-bold">
                  READY
                </span>
              </div>
              <p className="text-xs text-text-secondary">12 pull requests processed. 2 pull requests ready for automated deployment merge.</p>
            </div>
            <Link
              href="/digest"
              className="px-3 py-1.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-primary text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              View Report <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
