'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auditApi } from '@/lib/auditApi';
import { AuditLogDto, AuditDashboardStatsDto, AuditListQueryDto } from '@workspace/shared-types';
import { StatCard } from '@/components/tickets/StatCard';
import { AuditTable } from '@/components/audit/AuditTable';
import { CommandBar } from '@/components/ui/CommandBar';

export default function AuditConsolePage() {
  const { activeOrganization } = useAuth();
  const [stats, setStats] = useState<AuditDashboardStatsDto | null>(null);
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const loadStatsAndFilters = useCallback(async () => {
    if (!activeOrganization?.id) return;
    try {
      const [statsData, modulesData] = await Promise.all([
        auditApi.getStats(activeOrganization.id),
        auditApi.getModules(activeOrganization.id),
      ]);
      setStats(statsData);
      setModules(modulesData);
    } catch (err) {
      console.error('Failed to load audit stats & filters:', err);
    }
  }, [activeOrganization?.id]);

  const loadAuditLogs = useCallback(async () => {
    if (!activeOrganization?.id) return;
    setIsLoading(true);
    try {
      const query: AuditListQueryDto = {
        search: search.trim() || undefined,
        module: selectedModule !== 'ALL' ? selectedModule : undefined,
        action: selectedAction !== 'ALL' ? selectedAction : undefined,
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      const res = await auditApi.getLogs(query, activeOrganization.id);
      setLogs(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, search, selectedModule, selectedAction, page]);

  useEffect(() => {
    loadStatsAndFilters();
  }, [loadStatsAndFilters]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <div className="space-y-6">
      {/* FORGE UI Command Bar */}
      <CommandBar
        moduleName="Audit Console"
        moduleAccent="audit"
        breadcrumbs={['Workspace', 'Audit Console', 'System Trail']}
        searchPlaceholder="Search audit events by action, module, actor..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filterOptions={[
          { label: 'All Modules', value: 'ALL' },
          ...modules.slice(0, 4).map((m) => ({ label: m, value: m })),
        ]}
        activeFilter={selectedModule}
        onFilterChange={setSelectedModule}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Platform Events"
          value={stats?.totalEvents || 0}
          icon="📊"
          gradient="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          onClick={() => {
            setSelectedModule('ALL');
            setSelectedAction('ALL');
          }}
        />
        <StatCard
          title="Auth Events"
          value={stats?.authEvents || 0}
          icon="🔑"
          gradient="bg-primary/10 text-primary border border-primary/20"
        />
        <StatCard
          title="Ticket Events"
          value={stats?.ticketEvents || 0}
          icon="🎫"
          gradient="bg-primary/10 text-primary border border-primary/20"
        />
        <StatCard
          title="Review Events"
          value={stats?.reviewEvents || 0}
          icon="🔍"
          gradient="bg-primary/10 text-primary border border-primary/20"
        />
      </div>

      {/* Audit Log Table */}
      <AuditTable logs={logs} isLoading={isLoading} />

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border text-xs font-mono">
          <span className="text-muted-foreground">
            Page <span className="font-bold text-foreground">{page}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span> ({total} log events)
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
