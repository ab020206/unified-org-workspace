import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SecurityWarningCardProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function SecurityWarningCard({
  title,
  description,
  actionText,
  onAction,
}: SecurityWarningCardProps) {
  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-start gap-3 shadow-sm">
      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-sm leading-none text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="mt-2 text-xs font-semibold underline hover:text-amber-400 transition"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
