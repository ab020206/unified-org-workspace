import React from 'react';
import { PullRequestActivityDto } from '@workspace/shared-types';
import {
  Sparkles,
  Send,
  UserPlus,
  UserMinus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GitBranch,
  MessageSquare,
  GitMerge,
  Clock,
} from 'lucide-react';

interface Props {
  activities: PullRequestActivityDto[];
}

export function PRTimeline({ activities }: Props) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PR_CREATED':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-primary" />,
          label: 'PR Created',
          bg: 'bg-primary/10 text-primary border-primary/20',
        };
      case 'SUBMITTED_FOR_REVIEW':
        return {
          icon: <Send className="w-3.5 h-3.5 text-primary" />,
          label: 'Submitted for Review',
          bg: 'bg-surface-secondary text-text-primary border-border',
        };
      case 'REVIEWER_ASSIGNED':
        return {
          icon: <UserPlus className="w-3.5 h-3.5 text-info" />,
          label: 'Reviewer Assigned',
          bg: 'bg-info/10 text-info border-info/20',
        };
      case 'REVIEWER_REMOVED':
        return {
          icon: <UserMinus className="w-3.5 h-3.5 text-text-secondary" />,
          label: 'Reviewer Removed',
          bg: 'bg-surface-secondary text-text-secondary border-border',
        };
      case 'DECISION_APPROVED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
          label: 'Approved',
          bg: 'bg-success/10 text-success border-success/20',
        };
      case 'DECISION_CHANGES_REQUESTED':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-warning" />,
          label: 'Changes Requested',
          bg: 'bg-warning/10 text-warning border-warning/20',
        };
      case 'DECISION_REJECTED':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-error" />,
          label: 'Rejected',
          bg: 'bg-error/10 text-error border-error/20',
        };
      case 'VERSION_CREATED':
        return {
          icon: <GitBranch className="w-3.5 h-3.5 text-text-primary" />,
          label: 'New Version Created',
          bg: 'bg-surface-secondary text-text-primary border-border',
        };
      case 'COMMENT_ADDED':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-text-primary" />,
          label: 'Review Comment',
          bg: 'bg-surface-secondary text-text-primary border-border',
        };
      case 'MERGED':
        return {
          icon: <GitMerge className="w-3.5 h-3.5 text-success" />,
          label: 'PR Merged',
          bg: 'bg-success/10 text-success border-success/20',
        };
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-text-secondary" />,
          label: action,
          bg: 'bg-surface-secondary text-text-secondary border-border',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Clock className="w-4 h-4 text-primary" />
        <span>Review Activity Timeline ({activities.length})</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-text-secondary italic">No activity recorded.</p>
      ) : (
        <div className="relative pl-6 space-y-4 border-l border-border ml-2">
          {activities.map((act) => {
            const info = getActionBadge(act.action);
            return (
              <div key={act.id} className="relative group">
                <div className="absolute -left-[31px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-border text-xs shadow-xs">
                  {info.icon}
                </div>

                <div className="bg-surface p-3.5 rounded-md border border-border shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">
                      {act.actor ? `${act.actor.firstName} ${act.actor.lastName}` : 'System'}
                    </span>
                    <span className="text-[11px] text-text-secondary font-mono">
                      {new Date(act.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${info.bg}`}
                    >
                      {info.label}
                    </span>
                    {act.metadata && (
                      <p className="text-xs text-text-secondary italic">{act.metadata}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
