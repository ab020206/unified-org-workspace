'use client';

import React, { ReactNode } from 'react';
import { Layers } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}

export function EmptyState({ title, description, icon, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed border-border bg-card/40 my-4 space-y-4 shadow-2xs relative overflow-hidden">
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
        {icon || <Layers className="w-6 h-6" />}
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="font-bold text-base text-foreground tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
