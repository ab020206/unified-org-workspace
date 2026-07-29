import React from 'react';
import { UserSummaryDto, ReviewDecisionType } from '@workspace/shared-types';
import { Check, AlertTriangle, X, Clock } from 'lucide-react';

interface Props {
  reviewer: UserSummaryDto;
  decision?: ReviewDecisionType;
  onRemove?: () => void;
}

export function ReviewerAvatar({ reviewer, decision, onRemove }: Props) {
  const getDecisionBadge = () => {
    switch (decision) {
      case ReviewDecisionType.APPROVED:
        return { icon: <Check className="w-2.5 h-2.5 text-white" />, bg: 'bg-emerald-500', title: 'Approved' };
      case ReviewDecisionType.CHANGES_REQUESTED:
        return { icon: <AlertTriangle className="w-2.5 h-2.5 text-white" />, bg: 'bg-amber-500', title: 'Changes Requested' };
      case ReviewDecisionType.REJECTED:
        return { icon: <X className="w-2.5 h-2.5 text-white" />, bg: 'bg-rose-500', title: 'Rejected' };
      default:
        return { icon: <Clock className="w-2.5 h-2.5 text-white" />, bg: 'bg-slate-500', title: 'Pending Review' };
    }
  };

  const badge = getDecisionBadge();

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border bg-card shadow-2xs text-xs font-semibold">
      <div className="relative">
        <span className="h-6 w-6 rounded-md bg-purple-500/20 text-purple-600 font-bold flex items-center justify-center text-[10px] border border-purple-500/30">
          {reviewer.firstName[0]}
          {reviewer.lastName[0]}
        </span>
        <span
          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full flex items-center justify-center ${badge.bg}`}
          title={badge.title}
        >
          {badge.icon}
        </span>
      </div>

      <span className="text-foreground">
        {reviewer.firstName} {reviewer.lastName}
      </span>

      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-muted-foreground hover:text-rose-500 text-xs p-0.5 transition-colors"
          title="Remove reviewer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
