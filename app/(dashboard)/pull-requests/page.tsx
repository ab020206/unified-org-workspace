'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pullRequestApi } from '@/lib/pullRequestApi';
import { PullRequestDto, PullRequestStatus, Permission } from '@workspace/shared-types';
import { PRTable } from '@/components/review/PRTable';
import { CommandBar } from '@/components/ui/CommandBar';

export default function PullRequestsPage() {
  const { activeOrganization, hasPermission } = useAuth();
  const [prs, setPrs] = useState<PullRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadPRs = useCallback(async () => {
    if (!activeOrganization?.id) return;
    setIsLoading(true);
    try {
      const res = await pullRequestApi.getPullRequests(
        {
          search: search.trim() || undefined,
          status: statusFilter !== 'ALL' ? (statusFilter as PullRequestStatus) : undefined,
        },
        activeOrganization.id
      );
      setPrs(res.items);
    } catch (err) {
      console.error('Failed to load PRs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, search, statusFilter]);

  useEffect(() => {
    loadPRs();
  }, [loadPRs]);

  const canCreatePR = hasPermission(Permission.REVIEW_CREATE);

  return (
    <div className="space-y-6">
      {/* FORGE UI Command Bar */}
      <CommandBar
        moduleName="Review Console"
        moduleAccent="reviews"
        breadcrumbs={['Workspace', 'Review Console', 'Pull Requests']}
        searchPlaceholder="Search PRs by #, title, description..."
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={[
          { label: 'All PRs', value: 'ALL' },
          { label: 'Under Review', value: 'UNDER_REVIEW' },
          { label: 'Approved', value: 'APPROVED font-bold text-emerald-500' },
          { label: 'Merged', value: 'MERGED' },
          { label: 'Draft', value: 'DRAFT' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        primaryActionLabel={canCreatePR ? 'New Pull Request' : undefined}
        onPrimaryAction={() => (window.location.href = '/pull-requests/new')}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* PR Table with Purple Accent */}
      <PRTable pullRequests={prs} isLoading={isLoading} />
    </div>
  );
}
