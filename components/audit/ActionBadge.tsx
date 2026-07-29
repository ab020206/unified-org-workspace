import React from 'react';

interface Props {
  action: string;
  size?: 'sm' | 'md';
}

export function ActionBadge({ action, size = 'md' }: Props) {
  const getStyle = () => {
    const act = action.toUpperCase();
    if (
      act.includes('CREATE') ||
      act.includes('ACCEPT') ||
      act.includes('APPROVE') ||
      act.includes('MERGE')
    ) {
      return 'bg-success/10 text-success border-success/20';
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('REVOKE')) {
      return 'bg-error/10 text-error border-error/20';
    }
    if (act.includes('REJECT') || act.includes('CHANGES') || act.includes('WARNING')) {
      return 'bg-warning/10 text-warning border-warning/20';
    }
    return 'bg-surface-secondary text-text-primary border-border';
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md border shadow-xs ${getStyle()} ${sizeClasses[size]}`}
    >
      {action}
    </span>
  );
}
