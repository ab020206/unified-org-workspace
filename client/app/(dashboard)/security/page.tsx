'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Server, Key, Flag, Activity } from 'lucide-react';
import { securityApi, HealthCheckPayload } from '@/lib/securityApi';
import { SecuritySessionPayload, FeatureFlagPayload } from '@workspace/shared-types';
import { HealthStatusBadge } from '@/components/HealthStatusBadge';
import { SessionCard } from '@/components/SessionCard';
import { FeatureFlagToggle } from '@/components/FeatureFlagToggle';
import { SecurityWarningCard } from '@/components/SecurityWarningCard';
import { CommandBar } from '@/components/ui/CommandBar';

export default function SecurityDashboardPage() {
  const [activeTab, setActiveTab] = useState<'health' | 'sessions' | 'flags'>('health');

  // Health State
  const [health, setHealth] = useState<HealthCheckPayload | null>(null);

  // Session State
  const [sessions, setSessions] = useState<SecuritySessionPayload[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Feature Flag State
  const [flags, setFlags] = useState<FeatureFlagPayload[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await securityApi.getHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await securityApi.getActiveSessions();
      setSessions(data || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const fetchFlags = useCallback(async () => {
    setFlagsLoading(true);
    try {
      const data = await securityApi.getFeatureFlags();
      setFlags(data.details || []);
    } catch {
      setFlags([]);
    } finally {
      setFlagsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchSessions();
    fetchFlags();
  }, [fetchHealth, fetchSessions, fetchFlags]);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await securityApi.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to log out from all devices except this one?')) return;
    try {
      await securityApi.logoutAll();
      fetchSessions();
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to logout from all devices');
    }
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    setUpdatingKey(key);
    try {
      const updated = await securityApi.toggleFeatureFlag(key, enabled);
      setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: updated.enabled } : f)));
    } catch (err) {
      const error = err as Error;
      alert(error.message || 'Failed to toggle feature flag');
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* FORGE UI Command Bar */}
      <CommandBar
        moduleName="Security Console"
        moduleAccent="security"
        breadcrumbs={['Workspace', 'Security Console', 'Hardening & Flags']}
        searchPlaceholder="Search security sessions, flags, health..."
        primaryActionLabel="Refresh Health Status"
        onPrimaryAction={() => {
          fetchHealth();
          fetchSessions();
          fetchFlags();
        }}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'health'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          System Health
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'sessions'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Active Sessions ({sessions.length})
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'flags'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          Feature Flags ({flags.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <SecurityWarningCard
            title="Enterprise Security Hardening Active"
            description="Tenant isolation, IDOR protection, session rotation, and rate limiting are enforced across all endpoints."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card forge-accent-security space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Database Core</span>
                <HealthStatusBadge status={health?.services.database.status || 'checking'} />
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {health?.services.database.latencyMs ?? '--'}{' '}
                <span className="text-xs font-normal text-muted-foreground">ms latency</span>
              </div>
              <p className="text-[11px] text-muted-foreground">PostgreSQL Multi-tenant Engine</p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card forge-accent-security space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Redis Cache</span>
                <HealthStatusBadge status={health?.services.redis.status || 'checking'} />
              </div>
              <div className="text-2xl font-bold text-foreground font-mono">
                {health?.services.redis.latencyMs ?? '--'}{' '}
                <span className="text-xs font-normal text-muted-foreground">ms latency</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Rate limit & Session store</p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card forge-accent-security space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Queue Worker</span>
                <HealthStatusBadge status={health?.queue?.status || 'active'} />
              </div>
              <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Active
              </div>
              <p className="text-[11px] text-muted-foreground">Async background processing</p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground">Environment Diagnostics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                  Node Environment
                </span>
                <span className="font-bold text-foreground">
                  {health?.environment || 'development'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                  Server Uptime
                </span>
                <span className="font-bold text-foreground">
                  {health ? `${Math.floor(health.uptime / 60)} mins` : '--'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                  API Endpoint
                </span>
                <span className="font-bold text-foreground">/api/v1</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                  Security Standard
                </span>
                <span className="font-bold text-emerald-500">Enterprise Standard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Revoke active sessions or logout from all devices to protect your account.
            </p>
            <button
              onClick={handleLogoutAll}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-semibold text-xs border border-rose-500/20 hover:bg-rose-500/20 transition"
            >
              Log Out All Devices
            </button>
          </div>

          {sessionsLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">
              Loading active sessions...
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRevoke={handleRevokeSession}
                  isRevoking={revokingId === session.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No active sessions found.</p>
          )}
        </div>
      )}

      {activeTab === 'flags' && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Manage granular runtime feature flags for system modules.
          </p>

          {flagsLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">
              Loading feature flags...
            </div>
          ) : flags.length > 0 ? (
            <div className="space-y-3">
              {flags.map((flag) => (
                <FeatureFlagToggle
                  key={flag.key}
                  flag={flag}
                  onToggle={handleToggleFlag}
                  isUpdating={updatingKey === flag.key}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No feature flags registered.</p>
          )}
        </div>
      )}
    </div>
  );
}
