import React from 'react';
import { TicketStatus } from '@workspace/shared-types';

interface Props {
  status: TicketStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  TicketStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  [TicketStatus.OPEN]: {
    label: 'Open',
    bg: 'bg-surface-secondary',
    text: 'text-text-primary',
    border: 'border-border',
    dot: 'bg-primary',
  },
  [TicketStatus.IN_PROGRESS]: {
    label: 'In Progress',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    dot: 'bg-warning',
  },
  [TicketStatus.WAITING_FOR_RESPONSE]: {
    label: 'Waiting',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    dot: 'bg-warning',
  },
  [TicketStatus.RESOLVED]: {
    label: 'Resolved',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    dot: 'bg-success',
  },
  [TicketStatus.CLOSED]: {
    label: 'Closed',
    bg: 'bg-surface-secondary',
    text: 'text-text-secondary',
    border: 'border-border',
    dot: 'bg-text-secondary',
  },
  [TicketStatus.REOPENED]: {
    label: 'Reopened',
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error/20',
    dot: 'bg-error',
  },
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const config = statusConfig[status] || statusConfig[TicketStatus.OPEN];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-medium gap-1.5',
    md: 'px-2.5 py-0.5 text-xs font-medium gap-2',
    lg: 'px-3 py-1 text-sm font-medium gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono transition-all shadow-xs ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
