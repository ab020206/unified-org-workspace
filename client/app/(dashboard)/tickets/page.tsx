'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ticketApi } from '@/lib/ticketApi';
import {
  TicketDto,
  TicketDashboardStatsDto,
  TicketListQueryDto,
  Permission,
} from '@workspace/shared-types';
import { StatCard } from '@/components/tickets/StatCard';
import { FilterPanel } from '@/components/tickets/FilterPanel';
import { TicketTable } from '@/components/tickets/TicketTable';
import { CommandBar } from '@/components/ui/CommandBar';

export default function TicketsPage() {
  const { activeOrganization, user, members, hasPermission } = useAuth();
  const [stats, setStats] = useState<TicketDashboardStatsDto | null>(null);
  const [tickets, setTickets] = useState<TicketDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TicketListQueryDto>({
    page: 1,
    limit: 15,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

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
        }}
        primaryActionLabel={canCreateTicket ? 'New Ticket' : undefined}
        onPrimaryAction={() => (window.location.href = '/tickets/new')}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets || 0}
          icon="📊"
          gradient="bg-blue-500/10 text-blue-600 border border-blue-500/20"
          onClick={() => handleFilterChange({ status: undefined, assignedTo: undefined })}
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets || 0}
          icon="🟢"
          gradient="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          onClick={() => handleFilterChange({ status: 'OPEN' })}
        />
        <StatCard
          title="Assigned to Me"
          value={stats?.assignedToMeTickets || 0}
          icon="👤"
          gradient="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
          subtitle={user ? `${user.firstName} ${user.lastName}` : ''}
          onClick={() => handleFilterChange({ assignedTo: user?.id })}
        />
        <StatCard
          title="Recently Updated"
          value={stats?.recentlyUpdatedTickets.length || 0}
          icon="⚡"
          gradient="bg-purple-500/10 text-purple-600 border border-purple-500/20"
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
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border text-xs font-mono">
          <span className="text-muted-foreground">
            Page <span className="font-bold text-foreground">{page}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span> ({total} tickets)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-border bg-card disabled:opacity-40 hover:bg-secondary transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-border bg-card disabled:opacity-40 hover:bg-secondary transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
