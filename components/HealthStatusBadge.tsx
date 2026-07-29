import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthStatusBadgeProps {
  status: 'ok' | 'degraded' | 'error' | 'connected' | 'disconnected' | 'active' | string;
  label?: string;
}

export function HealthStatusBadge({ status, label }: HealthStatusBadgeProps) {
  const isGood = status === 'ok' || status === 'connected' || status === 'active';
  const isDegraded = status === 'degraded';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        isGood
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : isDegraded
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      )}
    >
      {isGood ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : isDegraded ? (
        <AlertTriangle className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      <span className="capitalize">{label || status}</span>
    </div>
  );
}
