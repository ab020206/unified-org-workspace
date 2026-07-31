'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import {
  Building2,
  Users,
  Ticket,
  GitPullRequest,
  Shield,
  Activity,
  Server,
  Database,
  Cpu,
  Zap,
  Radio,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/platform/stats`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error('Error fetching platform stats:', err));
  }, []);

  const overview = stats?.overview || {
    totalOrganizations: 0,
    totalUsers: 0,
    globalTickets: 0,
    globalReviews: 0,
    platformHealth: '100.00%',
    activeSessions: 0,
    auditOverview: 0,
    storageUsage: '0 MB',
    apiRequestsToday: '0',
    errorMonitoring: '0.00%',
    queueStatus: 'Idle (0 delayed)',
    systemMetrics: {
      cpuUsage: '0%',
      memoryUsage: '0%',
      dbConnections: '0 / 100',
      redisLatency: '0ms',
    },
  };

  const featureFlags = stats?.featureFlags || [];
  const recentOrgs = stats?.recentOrganizations || [];

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <CommandBar
        moduleName="Platform Super Admin Control Hub"
        moduleAccent="support"
        breadcrumbs={['Platform Administration', 'Global System Overview']}
        searchPlaceholder="Search across platform organizations, global users, feature flags, or audit logs..."
        primaryActionLabel="New Tenant Org"
        onPrimaryAction={() => router.push('/organizations/create')}
        onAiQuickAction={() => router.push('/digest')}
      />

      {/* Personalized Welcome Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium w-fit">
          <Radio className="w-3.5 h-3.5 text-primary" />
          <span>Platform Governance Mode</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
          Welcome,{' '}
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : 'Platform Admin'}
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Full platform governance across all multi-tenant organizations. Monitor platform health,
          manage feature flags, track active user throughput, and inspect global audit streams.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Organizations</span>
            <Building2 className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.totalOrganizations}
          </p>
          <p className="text-[13px] text-success font-medium">Active Tenants</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.totalUsers}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Platform Users</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Global Tickets</span>
            <Ticket className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.globalTickets}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Cross-Tenant</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Global Reviews</span>
            <GitPullRequest className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.globalReviews}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Code PRs</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Platform Health</span>
            <Activity className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.platformHealth}
          </p>
          <p className="text-[13px] text-success font-medium">SLA Uptime</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Active Sessions</span>
            <Zap className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.activeSessions}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Live Admin Sessions</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Audit Logs</span>
            <Shield className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.auditOverview}
          </p>
          <p className="text-[13px] text-success font-medium">Signed Logs</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Storage Usage</span>
            <HardDrive className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.storageUsage}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Encrypted Storage</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>API Requests</span>
            <Server className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.apiRequestsToday}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Req / 24h</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Error Rate</span>
            <AlertTriangle className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {overview.errorMonitoring}
          </p>
          <p className="text-[13px] text-success font-medium">0.01% Nominal</p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Metrics & Health */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <Cpu className="w-4 h-4 text-primary" />
                <span>Global System Infrastructure Metrics</span>
              </div>
              <span className="text-[11px] font-mono text-success px-2 py-0.5 rounded bg-success/10 border border-success/20">
                Live Subsystem Telemetry
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">
                  CPU Load
                </span>
                <p className="text-lg font-semibold text-text-primary font-mono">
                  {overview.systemMetrics.cpuUsage}
                </p>
              </div>

              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">
                  RAM Utilization
                </span>
                <p className="text-lg font-semibold text-text-primary font-mono">
                  {overview.systemMetrics.memoryUsage}
                </p>
              </div>

              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">DB Pool</span>
                <p className="text-lg font-semibold text-text-primary font-mono">
                  {overview.systemMetrics.dbConnections}
                </p>
              </div>

              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">
                  Redis Latency
                </span>
                <p className="text-lg font-semibold text-success font-mono">
                  {overview.systemMetrics.redisLatency}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary" />
                Queue Engine:{' '}
                <strong className="text-text-primary font-mono">{overview.queueStatus}</strong>
              </span>
              <Link
                href="/security"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Manage Security Controls <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Tenant Organizations Manager */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Tenant Organizations Overview</span>
              </div>
              <Link
                href="/organizations/create"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                + Provision Organization
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentOrgs.map((org: any) => (
                <div key={org.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-surface-secondary border border-border text-text-primary flex items-center justify-center font-medium text-xs font-mono">
                      {org.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-text-primary">{org.name}</h4>
                      <p className="text-[11px] font-mono text-text-secondary">slug: {org.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-text-secondary">{org.memberCount || 0} Members</span>
                    <span className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[10px] font-medium">
                      HEALTHY
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Flags & Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Feature Flags Control Matrix */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <ToggleRight className="w-4 h-4 text-primary" />
                <span>Platform Feature Flags</span>
              </div>
              <span className="text-[11px] font-mono text-text-secondary uppercase font-medium">
                Global State
              </span>
            </div>

            <div className="space-y-3">
              {featureFlags.map((flag: any) => (
                <div
                  key={flag.key}
                  className="p-3 rounded-md bg-surface-secondary/50 border border-border flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-medium text-xs text-text-primary font-mono">{flag.key}</h5>
                    <p className="text-[11px] text-text-secondary">{flag.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success font-medium">
                    ENABLED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-mono text-xs text-text-secondary uppercase tracking-wider font-medium">
              Platform Admin Actions
            </h4>
            <div className="space-y-2">
              <Link
                href="/organizations/create"
                className="w-full py-2.5 px-3.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>+ Provision New Tenant</span>
                <Building2 className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/audit"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Inspect Global Audit Log</span>
                <Shield className="w-3.5 h-3.5 text-primary" />
              </Link>

              <Link
                href="/security"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Platform Feature Flags</span>
                <ToggleLeft className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
