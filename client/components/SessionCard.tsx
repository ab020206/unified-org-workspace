import React from 'react';
import { Laptop, Smartphone, Globe, LogOut } from 'lucide-react';
import { SecuritySessionPayload } from '@workspace/shared-types';

interface SessionCardProps {
  session: SecuritySessionPayload;
  onRevoke: (sessionId: string) => void;
  isRevoking?: boolean;
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const isMobile =
    session.device?.toLowerCase().includes('mobile') ||
    session.browser?.toLowerCase().includes('mobile');

  return (
    <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4 shadow-sm hover:border-primary/30 transition">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-secondary text-foreground">
          {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              {session.browser || 'Web Browser'} ({session.device || 'Desktop'})
            </h4>
            {session.isCurrent && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                Current Session
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {session.ip || '127.0.0.1'}
            </span>
            <span>•</span>
            <span>Last active: {new Date(session.lastActivity).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {!session.isCurrent && (
        <button
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          Revoke
        </button>
      )}
    </div>
  );
}
