import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface RateLimitErrorComponentProps {
  message?: string;
  onRetry?: () => void;
}

export function RateLimitErrorComponent({
  message = 'Request limit reached. Please wait a moment before trying again.',
  onRetry,
}: RateLimitErrorComponentProps) {
  return (
    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 shrink-0" />
        <p className="text-xs font-semibold text-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
