import React from 'react';
import { TicketCategory } from '@workspace/shared-types';
import { Tag } from 'lucide-react';

interface Props {
  category: TicketCategory;
}

const categoryLabels: Record<TicketCategory, string> = {
  [TicketCategory.GENERAL]: 'General',
  [TicketCategory.BUG]: 'Bug',
  [TicketCategory.FEATURE_REQUEST]: 'Feature Request',
  [TicketCategory.BILLING]: 'Billing',
  [TicketCategory.TECHNICAL]: 'Technical',
  [TicketCategory.ACCOUNT]: 'Account',
  [TicketCategory.OTHER]: 'Other',
};

export function CategoryBadge({ category }: Props) {
  const label = categoryLabels[category] || category;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-surface-secondary text-text-primary border border-border">
      <Tag className="w-3 h-3 text-text-secondary" />
      <span>{label}</span>
    </span>
  );
}
