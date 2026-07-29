'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Shield,
  ShieldCheck,
  Lock,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Code,
  Key,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuditorDashboard() {
  const { user } = useAuth();
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [filterModule, setFilterModule] = useState<string>('ALL');

  // Simulated Audit Logs Stream for Auditor
  const auditLogs = [
    {
      id: 'aud-001',
      module: 'AUTHENTICATION',
      action: 'USER_LOGIN',
      actorEmail: 'auditor@acme.demo',
      entityType: 'User',
      entityId: 'usr-901',
      ipAddress: '192.168.1.1',
      previousState: { session: null },
      newState: { session: 'active', ip: '192.168.1.1' },
      createdAt: '2026-07-29T10:15:00Z',
    },
    {
      id: 'aud-002',
      module: 'SUPPORT_HUB',
      action: 'TICKET_UPDATED',
      actorEmail: 'support@acme.demo',
      entityType: 'Ticket',
      entityId: 'tck-402',
      ipAddress: '10.0.4.12',
      previousState: { status: 'OPEN', priority: 'MEDIUM' },
      newState: { status: 'IN_PROGRESS', priority: 'HIGH' },
      createdAt: '2026-07-29T09:40:00Z',
    },
    {
      id: 'aud-003',
      module: 'REVIEW_CONSOLE',
      action: 'PR_VERSION_CREATED',
      actorEmail: 'reviewer@acme.demo',
      entityType: 'PullRequest',
      entityId: 'pr-801',
      ipAddress: '172.16.0.4',
      previousState: { version: 1 },
      newState: { version: 2, title: 'Updated API validation schema' },
      createdAt: '2026-07-29T08:20:00Z',
    },
    {
      id: 'aud-004',
      module: 'SECURITY',
      action: 'TEMP_PASSWORD_GENERATED',
      actorEmail: 'admin@acme.demo',
      entityType: 'User',
      entityId: 'usr-104',
      ipAddress: '192.168.1.5',
      previousState: { passwordMustChange: false },
      newState: { passwordMustChange: true },
      createdAt: '2026-07-29T07:10:00Z',
    },
  ];

  const filteredLogs = auditLogs.filter(
    (log) => filterModule === 'ALL' || log.module === filterModule
  );

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <CommandBar
        moduleName="Global Compliance & Audit Trail"
        moduleAccent="audit"
        breadcrumbs={['Audit & Compliance', 'System Audit Stream']}
        searchPlaceholder="Search audit event IDs, actor emails, or entity diffs..."
        primaryActionLabel="Export Audit Stream"
        onPrimaryAction={() =>
          alert(`Exporting ${filteredLogs.length} immutable audit log records...`)
        }
      />

      {/* Read-Only Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium w-fit">
          <Lock className="w-3.5 h-3.5" />
          <span>Read-Only Compliance Mode Active</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
          Compliance & Governance Hub — Welcome,{' '}
          {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Auditor'}
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Immutable system audit log stream. You have read-only inspection access to{' '}
          <strong className="text-primary font-mono">{auditLogs.length} audit entries</strong>,
          security event traces, and state JSON diffs.
        </p>
      </div>

      {/* Auditor KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Audit Entries</span>
            <Shield className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {auditLogs.length}
          </p>
          <p className="text-[13px] text-success font-medium">Immutable Signed Logs</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Security Events</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">12</p>
          <p className="text-[13px] text-warning font-medium">Audited High-Severity Events</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Failed Logins</span>
            <Lock className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">0</p>
          <p className="text-[13px] text-success font-medium">Zero Critical Breaches</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Permission Changes</span>
            <Key className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">4</p>
          <p className="text-[13px] text-text-secondary font-medium">Active Role Overrides</p>
        </div>
      </div>

      {/* Main Auditor Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Stream Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Audit Stream Event Feed</span>
              </div>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">All Modules</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="SUPPORT_HUB">Support Hub</option>
                <option value="REVIEW_CONSOLE">Review Console</option>
                <option value="SECURITY">Security</option>
              </select>
            </div>

            {filteredLogs.length === 0 ? (
              <EmptyState
                title="No audit logs found for selected filter."
                description="Adjust your search query or module filter to view historical compliance logs."
                icon={<Shield className="w-6 h-6 text-text-secondary" />}
              />
            ) : (
              <div className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-surface-secondary px-2 rounded-md transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded uppercase bg-surface-secondary text-text-primary border border-border">
                          {log.module}
                        </span>
                        <span className="text-[11px] font-mono text-text-secondary">
                          {log.action}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-text-primary">
                        {log.actorEmail} — {log.entityType} ({log.entityId})
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-text-secondary">
                        {log.ipAddress}
                      </span>
                      <button className="px-2.5 py-1 rounded-md bg-surface border border-border text-primary hover:bg-surface-secondary text-[11px] font-medium flex items-center gap-1 cursor-pointer">
                        <Code className="w-3 h-3" /> State Diff
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auditor Quick Actions & State Inspector */}
        <div className="space-y-6">
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-mono text-xs text-text-secondary uppercase tracking-wider font-medium">
              Auditor Quick Actions
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => alert('Exporting full audit logs in CSV format...')}
                className="w-full py-2.5 px-3.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>Export Audit Logs (CSV/JSON)</span>
                <Download className="w-3.5 h-3.5" />
              </button>

              <Link
                href="/audit?tab=reports"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Generate Compliance Report</span>
                <FileSpreadsheet className="w-3.5 h-3.5 text-text-secondary" />
              </Link>
            </div>
          </div>

          {/* JSON State Diff Drawer / Inspector Preview */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-semibold text-xs text-text-primary flex items-center gap-2 border-b border-border pb-2">
              <Code className="w-4 h-4 text-primary" />
              <span>State JSON Diff Inspector</span>
            </h4>
            {selectedLog ? (
              <div className="space-y-2 text-xs font-mono">
                <p className="text-[11px] text-text-secondary">Log ID: {selectedLog.id}</p>
                <div className="p-3 rounded-md bg-surface-secondary border border-border text-[11px] text-text-primary overflow-x-auto">
                  <pre>
                    {JSON.stringify(
                      { previousState: selectedLog.previousState, newState: selectedLog.newState },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary">
                Select any audit stream event to inspect immutable before & after state diffs.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
