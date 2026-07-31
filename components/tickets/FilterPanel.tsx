import React from 'react';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  OrganizationMemberDto,
  TicketListQueryDto,
} from '@workspace/shared-types';

interface Props {
  filters: TicketListQueryDto;
  onChange: (filters: TicketListQueryDto) => void;
  members: OrganizationMemberDto[];
  currentUserId?: string;
}

export function FilterPanel({ filters, onChange, members, currentUserId }: Props) {
  const handleSelect = (key: keyof TicketListQueryDto, value: string) => {
    onChange({
      ...filters,
      [key]: value === 'ALL' || value === '' ? undefined : value,
    });
  };

  const handleReset = () => {
    onChange({});
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-surface p-3 rounded-2xl border border-border shadow-xs">
      {/* Status Filter */}
      <select
        value={typeof filters.status === 'string' ? filters.status : 'ALL'}
        onChange={(e) => handleSelect('status', e.target.value)}
        className="rounded-xl border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
      >
        <option value="ALL">All Statuses</option>
        <option value={TicketStatus.OPEN}>Open</option>
        <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
        <option value={TicketStatus.WAITING_FOR_RESPONSE}>Waiting for Response</option>
        <option value={TicketStatus.RESOLVED}>Resolved</option>
        <option value={TicketStatus.CLOSED}>Closed</option>
        <option value={TicketStatus.REOPENED}>Reopened</option>
      </select>

      {/* Priority Filter */}
      <select
        value={typeof filters.priority === 'string' ? filters.priority : 'ALL'}
        onChange={(e) => handleSelect('priority', e.target.value)}
        className="rounded-xl border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
      >
        <option value="ALL">All Priorities</option>
        <option value={TicketPriority.LOW}>Low</option>
        <option value={TicketPriority.MEDIUM}>Medium</option>
        <option value={TicketPriority.HIGH}>High</option>
        <option value={TicketPriority.URGENT}>Urgent</option>
      </select>

      {/* Category Filter */}
      <select
        value={typeof filters.category === 'string' ? filters.category : 'ALL'}
        onChange={(e) => handleSelect('category', e.target.value)}
        className="rounded-xl border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
      >
        <option value="ALL">All Categories</option>
        <option value={TicketCategory.GENERAL}>General</option>
        <option value={TicketCategory.BUG}>Bug</option>
        <option value={TicketCategory.FEATURE_REQUEST}>Feature Request</option>
        <option value={TicketCategory.BILLING}>Billing</option>
        <option value={TicketCategory.TECHNICAL}>Technical</option>
        <option value={TicketCategory.ACCOUNT}>Account</option>
        <option value={TicketCategory.OTHER}>Other</option>
      </select>

      {/* Assignee Filter */}
      <select
        value={filters.assignedTo || 'ALL'}
        onChange={(e) => handleSelect('assignedTo', e.target.value)}
        className="rounded-xl border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
      >
        <option value="ALL">All Assignees</option>
        <option value="unassigned">Unassigned</option>
        {currentUserId && <option value={currentUserId}>Assigned to Me</option>}
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.user.firstName} {m.user.lastName} ({m.role})
          </option>
        ))}
      </select>

      {/* Sort By */}
      <select
        value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split('-');
          onChange({
            ...filters,
            sortBy: sortBy as any,
            sortOrder: sortOrder as any,
          });
        }}
        className="rounded-xl border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/20 ml-auto transition-colors"
      >
        <option value="createdAt-desc">Newest First</option>
        <option value="createdAt-asc">Oldest First</option>
        <option value="updatedAt-desc">Recently Updated</option>
        <option value="ticketNumber-desc">Ticket # High to Low</option>
      </select>

      {/* Reset Filters */}
      {activeCount > 0 && (
        <button
          onClick={handleReset}
          className="px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-all"
        >
          Reset ({activeCount})
        </button>
      )}
    </div>
  );
}
