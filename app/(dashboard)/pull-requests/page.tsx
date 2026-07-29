'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { pullRequestApi } from '@/lib/pullRequestApi';
import { PullRequestDto, PullRequestStatus, Permission } from '@workspace/shared-types';
import { PRTable } from '@/components/review/PRTable';
import { CommandBar } from '@/components/ui/CommandBar';

function PullRequestsContent() {
  const { activeOrganization, hasPermission } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [prs, setPrs] = useState<PullRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const rawStatus = searchParams.get('status');
  const initialStatus =
    rawStatus === 'history' || rawStatus === 'MERGED' ? 'MERGED' : rawStatus || 'ALL';

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);

  // Sync state when URL query parameter changes (e.g., clicking sidebar links)
  useEffect(() => {
    const currentParam = searchParams.get('status');
    if (currentParam === 'history' || currentParam === 'MERGED') {
      setStatusFilter('MERGED');
    } else if (currentParam) {
      setStatusFilter(currentParam);
    } else {
      setStatusFilter('ALL');
    }
  }, [searchParams]);

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

  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', newFilter);
    }
    const queryString = params.toString();
    router.replace(queryString ? `/pull-requests?${queryString}` : '/pull-requests');
  };

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
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Merged', value: 'MERGED' },
          { label: 'Draft', value: 'DRAFT' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={handleFilterChange}
        primaryActionLabel={canCreatePR ? 'New Pull Request' : undefined}
        onPrimaryAction={() => (window.location.href = '/pull-requests/new')}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* PR Table with Brand Accent */}
      <PRTable pullRequests={prs} isLoading={isLoading} />
    </div>
  );
}

export default function PullRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="forge-panel forge-accent-reviews p-6 text-center animate-pulse">
          <div className="h-6 bg-surface-secondary rounded w-1/4 mb-4 mx-auto" />
        </div>
      }
    >
      <PullRequestsContent />
    </Suspense>
  );
}
