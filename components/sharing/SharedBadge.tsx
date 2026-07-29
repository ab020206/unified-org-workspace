import React from 'react';
import { SharePermission } from '@workspace/shared-types';

interface Props {
  permission: SharePermission;
}

export function SharedBadge({ permission }: Props) {
  const getStyle = () => {
    switch (permission) {
      case SharePermission.READ:
        return 'bg-info/10 text-info border-info/20';
      case SharePermission.COMMENT:
        return 'bg-surface-secondary text-text-primary border-border';
      case SharePermission.REVIEW:
        return 'bg-surface-secondary text-text-primary border-border';
      case SharePermission.APPROVE:
        return 'bg-success/10 text-success border-success/20';
      case SharePermission.FULL_ACCESS:
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-surface-secondary text-text-secondary border-border';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${getStyle()}`}
    >
      {permission}
    </span>
  );
}
