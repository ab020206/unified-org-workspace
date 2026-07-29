'use client';

import React from 'react';
import { Search, Sparkles, Plus, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommandBarProps {
  moduleName: string;
  moduleAccent?:
    'support' | 'reviews' | 'audit' | 'ai' | 'security' | 'notifications' | 'collaboration';
  breadcrumbs?: string[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onAiQuickAction?: () => void;
  filterOptions?: Array<{ label: string; value: string }>;
  activeFilter?: string;
  onFilterChange?: (val: string) => void;
  children?: React.ReactNode;
}

export function CommandBar({
  moduleName,
  moduleAccent = 'support',
  breadcrumbs = ['Workspace', moduleName],
  searchPlaceholder = `Search ${moduleName.toLowerCase()}...`,
  searchValue,
  onSearchChange,
  primaryActionLabel,
  onPrimaryAction,
  onAiQuickAction,
  filterOptions,
  activeFilter,
  onFilterChange,
  children,
}: CommandBarProps) {
  const getBadgeClass = () => {
    switch (moduleAccent) {
      case 'support':
        return 'bg-info/10 text-info border-info/20';
      case 'reviews':
        return 'bg-surface-secondary text-text-primary border-border';
      case 'audit':
        return 'bg-success/10 text-success border-success/20';
      case 'ai':
        return 'bg-surface-secondary text-text-primary border-border';
      case 'security':
        return 'bg-error/10 text-error border-error/20';
      case 'notifications':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-surface-secondary text-text-primary border-border';
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-secondary/50" />}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-text-primary font-semibold'
                  : 'hover:text-text-primary transition-colors'
              }
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Main Command Bar Container */}
      <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Module Title & Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={cn(
              'text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border',
              getBadgeClass()
            )}
          >
            {moduleName}
          </span>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-12 py-1.5 rounded-lg border border-border bg-surface-secondary/40 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-text-secondary bg-surface rounded border border-border">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Filters, AI Action, Primary CTA */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {filterOptions && filterOptions.length > 0 && (
            <div className="flex items-center gap-1 bg-surface-secondary/50 p-1 rounded-lg border border-border">
              <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary ml-1 mr-1" />
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onFilterChange?.(opt.value)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer',
                    activeFilter === opt.value
                      ? 'bg-surface text-text-primary shadow-xs font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {onAiQuickAction && (
            <button
              onClick={onAiQuickAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary text-text-primary border border-border text-xs font-semibold hover:bg-surface transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-text-secondary" />
              <span>AI Action</span>
            </button>
          )}

          {primaryActionLabel && onPrimaryAction && (
            <button
              onClick={onPrimaryAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{primaryActionLabel}</span>
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
