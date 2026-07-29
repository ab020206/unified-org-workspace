import React from 'react';
import { TicketActivityDto } from '@workspace/shared-types';
import {
  Sparkles,
  RefreshCw,
  Zap,
  User,
  MessageSquare,
  Paperclip,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react';

interface Props {
  activities: TicketActivityDto[];
}

export function TicketTimeline({ activities }: Props) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATED':
        return { icon: <Sparkles className="w-3.5 h-3.5 text-primary" />, label: 'Ticket created', bg: 'bg-primary/10 text-primary border-primary/20' };
      case 'STATUS_CHANGED':
        return { icon: <RefreshCw className="w-3.5 h-3.5 text-warning" />, label: 'Status updated', bg: 'bg-warning/10 text-warning border-warning/20' };
      case 'PRIORITY_CHANGED':
        return { icon: <Zap className="w-3.5 h-3.5 text-error" />, label: 'Priority changed', bg: 'bg-error/10 text-error border-error/20' };
      case 'ASSIGNED':
      case 'REASSIGNED':
        return { icon: <User className="w-3.5 h-3.5 text-info" />, label: 'Assignee updated', bg: 'bg-info/10 text-info border-info/20' };
      case 'UNASSIGNED':
        return { icon: <User className="w-3.5 h-3.5 text-text-secondary" />, label: 'Unassigned', bg: 'bg-surface-secondary text-text-secondary border-border' };
      case 'COMMENT_ADDED':
        return { icon: <MessageSquare className="w-3.5 h-3.5 text-text-primary" />, label: 'Comment added', bg: 'bg-surface-secondary text-text-primary border-border' };
      case 'ATTACHMENT_UPLOADED':
        return { icon: <Paperclip className="w-3.5 h-3.5 text-success" />, label: 'Attachment uploaded', bg: 'bg-success/10 text-success border-success/20' };
      case 'CLOSED':
        return { icon: <Lock className="w-3.5 h-3.5 text-text-secondary" />, label: 'Ticket closed', bg: 'bg-surface-secondary text-text-secondary border-border' };
      case 'REOPENED':
        return { icon: <Unlock className="w-3.5 h-3.5 text-warning" />, label: 'Ticket reopened', bg: 'bg-warning/10 text-warning border-warning/20' };
      default:
        return { icon: <Clock className="w-3.5 h-3.5 text-text-secondary" />, label: action, bg: 'bg-surface-secondary text-text-secondary border-border' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Clock className="w-4 h-4 text-primary" />
        <span>Activity History ({activities.length})</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-text-secondary italic">No activity recorded yet.</p>
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
                      {new Date(act.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${info.bg}`}>
                      {info.label}
                    </span>
                    {act.oldValue || act.newValue ? (
                      <span className="text-xs text-text-secondary font-mono">
                        {act.oldValue && <span className="line-through">{act.oldValue}</span>}
                        {act.oldValue && act.newValue && ' → '}
                        {act.newValue && <span className="font-semibold text-text-primary">{act.newValue}</span>}
                      </span>
                    ) : null}
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
