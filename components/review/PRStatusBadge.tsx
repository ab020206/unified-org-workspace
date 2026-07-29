import React from 'react';
import { PullRequestStatus } from '@workspace/shared-types';

interface Props {
  status: PullRequestStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  PullRequestStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  [PullRequestStatus.DRAFT]: {
    label: 'Draft',
    bg: 'bg-surface-secondary',
    text: 'text-text-secondary',
    border: 'border-border',
    dot: 'bg-text-secondary',
  },
  [PullRequestStatus.READY_FOR_REVIEW]: {
    label: 'Ready for Review',
    bg: 'bg-surface-secondary',
    text: 'text-text-primary',
    border: 'border-border',
    dot: 'bg-primary',
  },
  [PullRequestStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    dot: 'bg-warning',
  },
  [PullRequestStatus.CHANGES_REQUESTED]: {
    label: 'Changes Requested',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    dot: 'bg-warning',
  },
  [PullRequestStatus.APPROVED]: {
    label: 'Approved',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    dot: 'bg-success',
  },
  [PullRequestStatus.REJECTED]: {
    label: 'Rejected',
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error/20',
    dot: 'bg-error',
  },
  [PullRequestStatus.MERGED]: {
    label: 'Merged',
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    dot: 'bg-success',
  },
};

export function PRStatusBadge({ status, size = 'md' }: Props) {
  const config = statusConfig[status] || statusConfig[PullRequestStatus.DRAFT];

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
