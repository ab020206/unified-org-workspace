import React from 'react';
import Link from 'next/link';
import { NotificationDto, NotificationType } from '@workspace/shared-types';
import { Sparkles, Ticket, GitPullRequest, Share2, Shield, Bell, Check, Trash2, ExternalLink } from 'lucide-react';

interface Props {
  notification: NotificationDto;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead, onDelete }: Props) {
  const renderIcon = () => {
    switch (notification.type) {
      case NotificationType.AI_DIGEST:
        return <Sparkles className="w-4 h-4 text-primary" />;
      case NotificationType.TICKET_ASSIGNED:
        return <Ticket className="w-4 h-4 text-primary" />;
      case NotificationType.REVIEW_ASSIGNED:
      case NotificationType.REVIEW_APPROVED:
        return <GitPullRequest className="w-4 h-4 text-primary" />;
      case NotificationType.SHARE_RECEIVED:
        return <Share2 className="w-4 h-4 text-text-primary" />;
      case NotificationType.SECURITY:
        return <Shield className="w-4 h-4 text-error" />;
      default:
        return <Bell className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getTargetLink = () => {
    if (notification.referenceType === 'TICKET' && notification.referenceId) {
      return `/tickets/${notification.referenceId}`;
    }
    if (notification.referenceType === 'PULL_REQUEST' && notification.referenceId) {
      return `/pull-requests/${notification.referenceId}`;
    }
    if (notification.referenceType === 'DIGEST') {
      return `/digest`;
    }
    return null;
  };

  const link = getTargetLink();

  return (
    <div
      className={`p-4 rounded-md border transition-all flex items-start justify-between gap-3 ${
        notification.isRead
          ? 'bg-surface border-border opacity-85'
          : 'bg-surface-secondary border-primary/30 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-surface border border-border">
          {renderIcon()}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-text-primary">
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{notification.message}</p>

          <div className="flex items-center gap-3 pt-1 text-[11px] text-text-secondary font-mono">
            <span>{new Date(notification.createdAt).toLocaleString()}</span>
            {link && (
              <Link
                href={link}
                className="text-primary font-medium hover:underline flex items-center gap-0.5"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!notification.isRead && onMarkRead && (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="p-1 rounded text-text-secondary hover:text-success hover:bg-surface-secondary transition-colors cursor-pointer"
            title="Mark as Read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(notification.id)}
            className="p-1 rounded text-text-secondary hover:text-error hover:bg-surface-secondary transition-colors cursor-pointer"
            title="Delete Notification"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
