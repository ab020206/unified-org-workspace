'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CommandBar } from '@/components/ui/CommandBar';
import { useAuth } from '@/context/AuthContext';
import { Permission, Role } from '@workspace/shared-types';
import {
  ShieldAlert,
  Sparkles,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
  Activity,
  Key,
  Ticket,
  GitPullRequest,
  Check,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user, activeOrganization, hasPermission } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  const canViewAnalytics =
    hasPermission(Permission.AUDIT_ANALYTICS_READ) || hasPermission(Permission.AUDIT_READ);
  const canAcknowledge = hasPermission(Permission.ANOMALY_ACKNOWLEDGE);

  const fetchAnalytics = useCallback(async () => {
    if (!activeOrganization?.id || !canViewAnalytics) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'x-organization-id': activeOrganization.id,
      };

      const [resSummary, resAnomalies, resInsights] = await Promise.all([
        fetch('/api/v1/audit/analytics', { headers }).then((r) => r.json()),
        fetch('/api/v1/audit/anomalies', { headers }).then((r) => r.json()),
        fetch('/api/v1/audit/ai-insights', { headers }).then((r) => r.json()),
      ]);

      if (resSummary.success) setAnalytics(resSummary.data);
      if (resAnomalies.success) setAnomalies(resAnomalies.data);
      if (resInsights.success) setAiInsights(resInsights.data);
    } catch (err) {
      console.error('Failed to load audit analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, canViewAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleAcknowledge = async (id: string) => {
    if (!activeOrganization?.id) return;
    try {
      const res = await fetch(`/api/v1/audit/anomalies/${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'x-organization-id': activeOrganization.id,
          'Content-Type': 'application/json',
        },
      }).then((r) => r.json());

      if (res.success) {
        setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
      }
    } catch (err) {
      console.error('Failed to acknowledge anomaly alert:', err);
    }
  };

  if (!canViewAnalytics) {
    return (
      <div className="space-y-6">
        <CommandBar
          moduleName="Audit Analytics Engine"
          moduleAccent="security"
          breadcrumbs={['Workspace', 'Analytics']}
        />
        <div className="forge-panel forge-accent-security p-12 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-text-primary">Access Restricted</h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Your role does not grant permission to view audit analytics or security insights. Please
            contact your Organization Administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Advanced Audit Analytics & Intelligence"
        moduleAccent="security"
        breadcrumbs={['Workspace', 'Audit & Security', 'Analytics']}
        filterOptions={[
          { label: 'Past 24 Hours', value: '24h' },
          { label: 'Past 7 Days', value: '7d' },
          { label: 'Past 30 Days', value: '30d' },
        ]}
        activeFilter={dateRange}
        onFilterChange={setDateRange}
        primaryActionLabel="Refresh Intelligence"
        onPrimaryAction={fetchAnalytics}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* AI Executive Insights Banner */}
      <div className="forge-panel forge-accent-ai p-6 bg-gradient-to-r from-primary/20 via-surface to-primary/10 border border-primary/30 relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>AI Executive Audit Insights</span>
          </div>
          <span className="text-[10px] font-mono text-text-secondary bg-surface-secondary px-2 py-0.5 rounded border border-border">
            Real-time Synthesis
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.length > 0 ? (
            aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-surface/80 border border-primary/20 text-xs text-text-primary"
              >
                <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-secondary italic col-span-2">
              Generating AI insights from recent workspace trajectory...
            </p>
          )}
        </div>
      </div>

      {/* Anomaly Detection Alerts Section */}
      {anomalies.length > 0 && (
        <div className="forge-panel forge-accent-security p-6 space-y-4 border-amber-900/40 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>
                Security Anomaly Detection System ({anomalies.filter((a) => !a.acknowledged).length}{' '}
                Active Alerts)
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {anomalies.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                  alert.acknowledged
                    ? 'bg-surface-secondary/40 border-border opacity-60'
                    : alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-900 text-rose-200 border-rose-700'
                        : 'bg-amber-900 text-amber-200 border-amber-700'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-[11px] text-text-secondary">{alert.description}</p>
                  </div>
                </div>
                <div>
                  {alert.acknowledged ? (
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Acknowledged
                    </span>
                  ) : canAcknowledge ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-mono uppercase">User Logins</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[28px] font-semibold text-text-primary font-mono leading-tight">
            {isLoading ? '...' : analytics?.totalLogins || 0}
          </p>
          <p className="text-[11px] text-text-secondary font-medium">Authentication events</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-mono uppercase">Tickets Created</span>
            <Ticket className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[28px] font-semibold text-text-primary font-mono leading-tight">
            {isLoading ? '...' : analytics?.ticketsCreated || 0}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">Support workspace</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-mono uppercase">PRs Reviewed</span>
            <GitPullRequest className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[28px] font-semibold text-text-primary font-mono leading-tight">
            {isLoading ? '...' : analytics?.reviewsCreated || 0}
          </p>
          <p className="text-[11px] text-primary font-medium">
            {analytics?.reviewsApproved || 0} Approved
          </p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-mono uppercase">Policy & Perm Changes</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-[28px] font-semibold text-text-primary font-mono leading-tight">
            {isLoading ? '...' : analytics?.permissionChanges || 0}
          </p>
          <p className="text-[11px] text-amber-400 font-medium">RBAC Overrides</p>
        </div>
      </div>

      {/* Activity Breakdown & Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Users */}
        <div className="forge-panel forge-accent-security p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Most Active Operators
          </h3>
          <div className="space-y-2">
            {analytics?.mostActiveUsers?.length > 0 ? (
              analytics.mostActiveUsers.map((u: any) => (
                <div
                  key={u.userId}
                  className="flex items-center justify-between p-2.5 rounded bg-surface-secondary/50 border border-border/60 text-xs"
                >
                  <span className="font-mono text-text-primary">{u.email}</span>
                  <span className="font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                    {u.actionCount} actions
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-secondary italic">No active user data logged.</p>
            )}
          </div>
        </div>

        {/* Most Frequent Actions */}
        <div className="forge-panel forge-accent-security p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Top Audit Event Types
          </h3>
          <div className="space-y-2">
            {analytics?.mostFrequentActions?.length > 0 ? (
              analytics.mostFrequentActions.map((a: any) => (
                <div
                  key={a.action}
                  className="flex items-center justify-between p-2.5 rounded bg-surface-secondary/50 border border-border/60 text-xs"
                >
                  <span className="font-mono text-text-primary">{a.action}</span>
                  <span className="font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                    {a.count} occurrences
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-secondary italic">No frequent action data logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
