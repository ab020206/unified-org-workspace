'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auditApi } from '@/lib/auditApi';
import { AuditLogDto } from '@workspace/shared-types';
import { ActionBadge } from '@/components/audit/ActionBadge';
import { ModuleBadge } from '@/components/audit/ModuleBadge';
import { JsonViewer } from '@/components/audit/JsonViewer';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AuditDetailPage() {
  const params = useParams();
  const logId = params.id as string;

  const { activeOrganization } = useAuth();
  const [log, setLog] = useState<AuditLogDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLog = useCallback(async () => {
    if (!activeOrganization?.id || !logId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditApi.getLogById(logId, activeOrganization.id);
      setLog(data);
    } catch (err: any) {
      setError(err.message || 'Audit event record not found');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, logId]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800/50 rounded-3xl" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="forge-panel p-8 max-w-md mx-auto text-center space-y-4 mt-12 forge-accent-audit">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Audit Event Record Not Found</h2>
        <p className="text-xs text-muted-foreground">
          {error || 'The audit record does not exist or access is restricted.'}
        </p>
        <Link
          href="/audit"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Audit Console</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div>
        <Link
          href="/audit"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Audit Console</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ModuleBadge module={log.module} />
              <ActionBadge action={log.action} size="md" />
            </div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Event #{log.id}
            </h1>
            <p className="text-xs font-mono text-gray-400">
              Timestamp: {new Date(log.createdAt).toUTCString()} (
              {new Date(log.createdAt).toLocaleString()})
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300">
            Entity:{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.entityType}</span>{' '}
            ({log.entityId})
          </div>
        </div>

        {/* Actor & Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actor Info */}
          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Actor Context
            </h3>
            <div className="flex items-center gap-3 pt-1">
              <span className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                {log.actor ? log.actor.firstName[0] : 'A'}
              </span>
              <div className="text-xs">
                <p className="font-bold text-gray-900 dark:text-white">
                  {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : log.actorEmail}
                </p>
                <p className="text-gray-500">{log.actorEmail}</p>
                <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  Role: {log.actorRole}
                </p>
              </div>
            </div>
          </div>

          {/* Request Tracing Metadata */}
          <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Request Tracing
            </h3>
            <div className="space-y-1 font-mono text-[11px] text-gray-700 dark:text-gray-300 pt-1">
              <div>
                IP Address:{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  {log.ipAddress || '127.0.0.1'}
                </span>
              </div>
              <div>
                Request ID:{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  {log.requestId || 'N/A'}
                </span>
              </div>
              <div className="truncate">
                User Agent: <span className="text-gray-500">{log.userAgent || 'Server Agent'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            <span>State Change Comparison</span>
          </div>
          <JsonViewer previousState={log.previousState} newState={log.newState} />
        </div>
      </div>
    </div>
  );
}
