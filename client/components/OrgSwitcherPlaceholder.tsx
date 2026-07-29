'use client';

import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';

export function OrgSwitcherPlaceholder() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border/50 text-sm font-medium transition-colors cursor-pointer select-none">
      <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary">
        <Building2 className="w-3.5 h-3.5" />
      </div>
      <span className="max-w-[140px] truncate text-foreground/90">Acme Corp</span>
      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
        Enterprise
      </span>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
    </div>
  );
}
