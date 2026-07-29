'use client';

import React from 'react';
import Link from 'next/link';
import { TicketDto } from '@workspace/shared-types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { useInspector } from '@/providers/InspectorProvider';
import { Eye, ExternalLink } from 'lucide-react';

interface Props {
  tickets: TicketDto[];
  isLoading?: boolean;
}

export function TicketTable({ tickets, isLoading }: Props) {
  const { openInspector } = useInspector();

  if (isLoading) {
    return (
      <div className="forge-panel forge-accent-support p-6 text-center animate-pulse">
        <div className="h-6 bg-surface-secondary rounded w-1/4 mb-4 mx-auto" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-surface-secondary/60 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="forge-panel forge-accent-support p-12 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-surface-secondary text-text-primary mx-auto flex items-center justify-center font-bold font-mono border border-border">
          #
        </div>
        <h3 className="text-sm font-bold text-text-primary">No support tickets found</h3>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          No support tickets match your filter criteria. Create a ticket or adjust query settings.
        </p>
      </div>
    );
  }

  return (
    <div className="forge-panel forge-accent-support overflow-x-auto shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-surface-secondary/50 border-b border-border sticky top-0 font-mono">
          <tr className="text-text-secondary uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Ticket</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Assigned To</th>
            <th className="py-3 px-4">Created By</th>
            <th className="py-3 px-4 text-right">Updated</th>
            <th className="py-3 px-4 text-right">Inspect</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => openInspector('ticket', ticket)}
              className="hover:bg-surface-secondary/60 transition-colors group cursor-pointer"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-text-primary bg-surface-secondary px-2 py-0.5 rounded border border-border">
                    #{ticket.ticketNumber}
                  </span>
                  <span className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {ticket.title}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={ticket.status} size="sm" />
              </td>
              <td className="py-3 px-4">
                <PriorityBadge priority={ticket.priority} size="sm" />
              </td>
              <td className="py-3 px-4">
                <CategoryBadge category={ticket.category} />
              </td>
              <td className="py-3 px-4 text-text-primary">
                {ticket.assignee ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-5 w-5 rounded bg-surface-secondary text-text-primary font-bold text-[10px] flex items-center justify-center border border-border font-mono">
                      {ticket.assignee.firstName[0]}
                      {ticket.assignee.lastName[0]}
                    </span>
                    <span>
                      {ticket.assignee.firstName} {ticket.assignee.lastName}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs italic text-text-secondary">Unassigned</span>
                )}
              </td>
              <td className="py-3 px-4 text-xs text-text-secondary">
                {ticket.creator
                  ? `${ticket.creator.firstName} ${ticket.creator.lastName}`
                  : 'System'}
              </td>
              <td className="py-3 px-4 text-right text-xs text-text-secondary font-mono">
                {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openInspector('ticket', ticket)}
                    className="p-1 rounded hover:bg-surface-secondary text-text-secondary hover:text-primary transition-colors cursor-pointer"
                    title="Slide-Over Inspector"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="p-1 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
                    title="Full Page View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
