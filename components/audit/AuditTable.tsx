'use client';

import React from 'react';
import Link from 'next/link';
import { AuditLogDto } from '@workspace/shared-types';
import { ActionBadge } from './ActionBadge';
import { ModuleBadge } from './ModuleBadge';
import { useInspector } from '@/providers/InspectorProvider';
import { Eye, ExternalLink } from 'lucide-react';

interface Props {
  logs: AuditLogDto[];
  isLoading?: boolean;
}

export function AuditTable({ logs, isLoading }: Props) {
  const { openInspector } = useInspector();

  if (isLoading) {
    return (
      <div className="forge-panel forge-accent-audit p-6 text-center animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-muted/60 rounded-lg" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="forge-panel forge-accent-audit p-12 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center font-bold font-mono">
          LOG
        </div>
        <h3 className="text-sm font-bold text-foreground">No audit records found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No system activity events match your active filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="forge-panel forge-accent-audit overflow-x-auto shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-muted/50 border-b border-border sticky top-0 font-mono">
          <tr className="text-muted-foreground uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Actor</th>
            <th className="py-3 px-4">Module</th>
            <th className="py-3 px-4">Action</th>
            <th className="py-3 px-4">Entity</th>
            <th className="py-3 px-4 text-right">Inspect</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium">
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => openInspector('audit', log)}
              className="hover:bg-muted/40 transition-colors group cursor-pointer"
            >
              <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                {new Date(log.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-emerald-500/20 text-emerald-600 font-bold text-[9px] flex items-center justify-center">
                    {log.actor ? log.actor.firstName[0] : 'A'}
                  </span>
                  <div className="text-xs">
                    <span className="font-semibold text-foreground block">
                      {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : log.actorEmail}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {log.actorRole}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <ModuleBadge module={log.module} />
              </td>
              <td className="py-3 px-4">
                <ActionBadge action={log.action} size="sm" />
              </td>
              <td className="py-3 px-4 text-xs">
                <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  {log.entityType} #{log.entityId.substring(0, 8)}
                </span>
              </td>
              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openInspector('audit', log)}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-emerald-500 transition-colors"
                    title="Slide-Over Inspector"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/audit/${log.id}`}
                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Full Details Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
