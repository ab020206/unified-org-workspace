'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ticketApi } from '@/lib/ticketApi';
import {
  TicketDto,
  TicketDashboardStatsDto,
  TicketListQueryDto,
  Permission,
  TicketCategory,
  TicketPriority,
} from '@workspace/shared-types';
import { StatCard } from '@/components/tickets/StatCard';
import { FilterPanel } from '@/components/tickets/FilterPanel';
import { TicketTable } from '@/components/tickets/TicketTable';
import { CommandBar } from '@/components/ui/CommandBar';
import { LifeBuoy, PlusCircle, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const { activeOrganization, user, members, hasPermission } = useAuth();
  const [stats, setStats] = useState<TicketDashboardStatsDto | null>(null);
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'create'>('all');
  const [filters, setFilters] = useState<TicketListQueryDto>({
    page: 1,
    limit: 15,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Create Ticket Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.GENERAL);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!activeOrganization?.id) return;
    try {
      const data = await ticketApi.getStats(activeOrganization.id);
      setStats(data);
    } catch (err) {
      console.error('Failed to load ticket stats:', err);
    }
  }, [activeOrganization?.id]);

  const loadTickets = useCallback(async () => {
    if (!activeOrganization?.id) return;
    setIsLoading(true);
    try {
      const query: TicketListQueryDto = {
        ...filters,
        search: search.trim() || undefined,
        page,
      };
      const res = await ticketApi.getTickets(query, activeOrganization.id);
      setTickets(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, filters, search, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setPage(1);
    setActiveTab('all');
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Title and Description are required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await ticketApi.createTicket(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          assignedTo: assignedTo || null,
        },
        activeOrganization?.id
      );

      setSuccessMessage('Ticket created successfully!');
      setTitle('');
      setDescription('');
      setCategory(TicketCategory.GENERAL);
      setPriority(TicketPriority.MEDIUM);
      setAssignedTo('');

      await loadStats();
      await loadTickets();

      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('all');
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCreateTicket = hasPermission(Permission.TICKET_CREATE);

  return (
    <div className="space-y-6">
      {/* FORGE UI Command Bar */}
      <CommandBar
        moduleName="Support Hub"
        moduleAccent="support"
        breadcrumbs={['Workspace', 'Support Hub', 'Tickets']}
        searchPlaceholder="Search tickets by #, title, description..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
          if (val) setActiveTab('all');
        }}
        primaryActionLabel={canCreateTicket ? 'New Ticket' : undefined}
        onPrimaryAction={() => setActiveTab('create')}
        onAiQuickAction={() => router.push('/digest')}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>All Support Tickets ({total})</span>
        </button>

        {canCreateTicket && (
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>
        )}
      </div>

      {/* TAB 1: ALL TICKETS DIRECTORY */}
      {activeTab === 'all' && (
        <>
          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Tickets"
              value={stats?.totalTickets || 0}
              icon="📊"
              gradient="bg-surface-secondary text-text-primary border border-border"
              onClick={() => handleFilterChange({ status: undefined, assignedTo: undefined })}
            />
            <StatCard
              title="Open Tickets"
              value={stats?.openTickets || 0}
              icon="🟢"
              gradient="bg-success/10 text-success border border-success/20"
              onClick={() => handleFilterChange({ status: 'OPEN' })}
            />
            <StatCard
              title="Assigned to Me"
              value={stats?.assignedToMeTickets || 0}
              icon="👤"
              gradient="bg-primary/10 text-primary border border-primary/20"
              subtitle={user ? `${user.firstName} ${user.lastName}` : ''}
              onClick={() => handleFilterChange({ assignedTo: user?.id })}
            />
            <StatCard
              title="Recently Updated"
              value={stats?.recentlyUpdatedTickets.length || 0}
              icon="⚡"
              gradient="bg-warning/10 text-warning border border-warning/20"
              onClick={() => handleFilterChange({ sortBy: 'updatedAt', sortOrder: 'desc' })}
            />
          </div>

          {/* Filters Panel */}
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            members={members}
            currentUserId={user?.id}
          />

          {/* Ticket Table */}
          <TicketTable tickets={tickets} isLoading={isLoading} />

          {/* Pagination Footer */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border text-xs font-mono">
              <span className="text-text-secondary">
                Page <span className="font-bold text-text-primary">{page}</span> of{' '}
                <span className="font-bold text-text-primary">{totalPages}</span> ({total} tickets)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface disabled:opacity-40 hover:bg-surface-secondary transition-all cursor-pointer text-text-primary"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface disabled:opacity-40 hover:bg-surface-secondary transition-all cursor-pointer text-text-primary"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: CREATE TICKET FORM */}
      {activeTab === 'create' && (
        <div className="p-6 md:p-8 rounded-[10px] border border-border bg-surface shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-border pb-4 space-y-1">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">
              Provision New Support Ticket
            </h2>
            <p className="text-xs text-text-secondary">
              Submit a support request or bug report for{' '}
              <strong className="text-text-primary">
                {activeOrganization?.name || 'Current Workspace'}
              </strong>
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded-md bg-error/10 border border-error/20 text-error text-xs font-semibold font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-md bg-success/10 border border-success/20 text-success text-xs font-semibold font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateTicketSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Ticket Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cannot process invoice payment for client"
                className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Description *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or feature request in detail..."
                className="w-full rounded-md border border-border bg-surface p-3.5 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all resize-y"
              />
            </div>

            {/* Grid of Category, Priority, Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full rounded-md border border-border bg-surface p-2.5 text-xs font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs cursor-pointer font-mono"
                >
                  <option value={TicketCategory.GENERAL}>General</option>
                  <option value={TicketCategory.BUG}>Bug</option>
                  <option value={TicketCategory.FEATURE_REQUEST}>Feature Request</option>
                  <option value={TicketCategory.BILLING}>Billing</option>
                  <option value={TicketCategory.TECHNICAL}>Technical</option>
                  <option value={TicketCategory.ACCOUNT}>Account</option>
                  <option value={TicketCategory.OTHER}>Other</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full rounded-md border border-border bg-surface p-2.5 text-xs font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs cursor-pointer font-mono"
                >
                  <option value={TicketPriority.LOW}>Low</option>
                  <option value={TicketPriority.MEDIUM}>Medium</option>
                  <option value={TicketPriority.HIGH}>High</option>
                  <option value={TicketPriority.URGENT}>Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Assignee (Optional)
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface p-2.5 text-xs font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs cursor-pointer font-mono"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.firstName} {m.user?.lastName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-md border border-border bg-surface-secondary hover:bg-surface text-xs font-medium text-text-primary transition-all cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
