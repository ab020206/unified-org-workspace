import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

interface Props {
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
}

export function JsonViewer({ previousState, newState }: Props) {
  const hasPrev = previousState && Object.keys(previousState).length > 0;
  const hasNext = newState && Object.keys(newState).length > 0;

  if (!hasPrev && !hasNext) {
    return (
      <div className="p-4 text-center rounded-xl border border-border bg-card text-xs text-muted-foreground italic font-mono">
        No state payload captured for this event.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Previous State */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
          <span className="flex items-center gap-1.5">
            <Undo2 className="w-3.5 h-3.5" /> Previous State
          </span>
          {!hasPrev && <span className="text-[10px] text-muted-foreground font-normal">None</span>}
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 font-mono text-xs text-foreground overflow-x-auto max-h-80">
          {hasPrev ? (
            <pre>{JSON.stringify(previousState, null, 2)}</pre>
          ) : (
            <span className="text-muted-foreground italic">No previous state.</span>
          )}
        </div>
      </div>

      {/* New State */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
          <span className="flex items-center gap-1.5">
            <Redo2 className="w-3.5 h-3.5" /> New State
          </span>
          {!hasNext && <span className="text-[10px] text-muted-foreground font-normal">None</span>}
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 font-mono text-xs text-foreground overflow-x-auto max-h-80">
          {hasNext ? (
            <pre>{JSON.stringify(newState, null, 2)}</pre>
          ) : (
            <span className="text-muted-foreground italic">No new state.</span>
          )}
        </div>
      </div>
    </div>
  );
}
