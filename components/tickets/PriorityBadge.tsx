import React from 'react';
import { TicketPriority } from '@workspace/shared-types';
import { ArrowDown, Minus, ArrowUp, Flame } from 'lucide-react';

interface Props {
  priority: TicketPriority;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: Props) {
  const renderIcon = () => {
    switch (priority) {
      case TicketPriority.LOW:
        return <ArrowDown className="w-3 h-3 text-text-secondary" />;
      case TicketPriority.MEDIUM:
        return <Minus className="w-3 h-3 text-info" />;
      case TicketPriority.HIGH:
        return <ArrowUp className="w-3 h-3 text-warning" />;
      case TicketPriority.URGENT:
        return <Flame className="w-3 h-3 text-error" />;
      default:
        return <Minus className="w-3 h-3 text-text-secondary" />;
    }
  };

  const getStyle = () => {
    switch (priority) {
      case TicketPriority.LOW:
        return 'bg-surface-secondary text-text-secondary border-border';
      case TicketPriority.MEDIUM:
        return 'bg-info/10 text-info border-info/20';
      case TicketPriority.HIGH:
        return 'bg-warning/10 text-warning border-warning/20';
      case TicketPriority.URGENT:
        return 'bg-error/10 text-error border-error/20 font-bold';
      default:
        return 'bg-surface-secondary text-text-secondary border-border';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-mono gap-1',
    md: 'px-2.5 py-1 text-xs font-mono gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-mono gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold ${getStyle()} ${sizeClasses[size]}`}
    >
      {renderIcon()}
      <span>{priority}</span>
    </span>
  );
}
