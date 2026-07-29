import React from 'react';
import { Lock, Building2, Ticket, GitPullRequest, Globe, Settings } from 'lucide-react';

interface Props {
  module: string;
}

export function ModuleBadge({ module }: Props) {
  const renderIcon = () => {
    switch (module.toUpperCase()) {
      case 'AUTHENTICATION':
        return <Lock className="w-3 h-3 text-primary" />;
      case 'ORGANIZATION':
        return <Building2 className="w-3 h-3 text-text-secondary" />;
      case 'SUPPORT_HUB':
        return <Ticket className="w-3 h-3 text-text-secondary" />;
      case 'REVIEW_CONSOLE':
        return <GitPullRequest className="w-3 h-3 text-text-secondary" />;
      case 'PLATFORM':
        return <Globe className="w-3 h-3 text-primary" />;
      default:
        return <Settings className="w-3 h-3 text-text-secondary" />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border bg-surface text-xs font-mono font-medium text-text-primary shadow-xs">
      {renderIcon()}
      <span>{module}</span>
    </span>
  );
}
