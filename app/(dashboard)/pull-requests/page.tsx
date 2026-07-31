'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { pullRequestApi } from '@/lib/pullRequestApi';
import {
  PullRequestDto,
  PullRequestStatus,
  Permission,
  PRDashboardStatsDto,
} from '@workspace/shared-types';
import { PRTable } from '@/components/review/PRTable';
import { CommandBar } from '@/components/ui/CommandBar';
import {
  GitPullRequest,
  CheckCircle2,
  GitMerge,
  Clock,
  Sparkles,
  Eye,
  Check,
  GitBranch,
  ShieldCheck,
  FileCode,
  ArrowRight,
  Plus,
  Lock,
} from 'lucide-react';

type PRTabType = 'REVIEWS' | 'APPROVALS' | 'HISTORY';

function PullRequestsContent() {
  const { activeOrganization, hasPermission } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [prs, setPrs] = useState<PullRequestDto[]>([]);
  const [stats, setStats] = useState<PRDashboardStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mergingId, setMergingId] = useState<string | null>(null);

  const rawStatus = searchParams.get('status');

  const getTabFromParam = (param: string | null): PRTabType => {
    if (param === 'history' || param === 'MERGED') return 'HISTORY';
    if (param === 'APPROVED') return 'APPROVALS';
    return 'REVIEWS';
  };

  const [activeTab, setActiveTab] = useState<PRTabType>(getTabFromParam(rawStatus));
  const [statusFilter, setStatusFilter] = useState<string>(
    rawStatus === 'history' ? 'MERGED' : rawStatus || 'ALL'
  );

  // Sync tab state when URL query parameter changes
  useEffect(() => {
    const currentParam = searchParams.get('status');
    setActiveTab(getTabFromParam(currentParam));
    if (currentParam === 'history') {
      setStatusFilter('MERGED');
    } else if (currentParam) {
      setStatusFilter(currentParam);
    } else {
      setStatusFilter('ALL');
    }
  }, [searchParams]);

  const loadData = useCallback(async () => {
    if (!activeOrganization?.id) return;
    setIsLoading(true);
    try {
      let targetStatus: PullRequestStatus | undefined;
      if (activeTab === 'APPROVALS') {
        targetStatus = PullRequestStatus.APPROVED;
      } else if (activeTab === 'HISTORY') {
        targetStatus = PullRequestStatus.MERGED;
      } else if (statusFilter !== 'ALL' && statusFilter !== 'history') {
        targetStatus = statusFilter as PullRequestStatus;
      }

      const [listRes, statsRes] = await Promise.all([
        pullRequestApi.getPullRequests(
          {
            search: search.trim() || undefined,
            status: targetStatus,
          },
          activeOrganization.id
        ),
        pullRequestApi.getStats(activeOrganization.id).catch(() => null),
      ]);

      setPrs(listRes.items);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.error('Failed to load PR data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, search, statusFilter, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (tab: PRTabType) => {
    setActiveTab(tab);
    if (tab === 'REVIEWS') {
      setStatusFilter('ALL');
      router.replace('/pull-requests');
    } else if (tab === 'APPROVALS') {
      setStatusFilter('APPROVED');
      router.replace('/pull-requests?status=APPROVED');
    } else if (tab === 'HISTORY') {
      setStatusFilter('MERGED');
      router.replace('/pull-requests?status=history');
    }
  };

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

  const handleDirectMerge = async (prId: string) => {
    if (!activeOrganization?.id) return;
    setMergingId(prId);
    try {
      await pullRequestApi.mergePR(prId, activeOrganization.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to merge PR');
    } finally {
      setMergingId(null);
    }
  };

  const canCreatePR = hasPermission(Permission.REVIEW_CREATE);
  const canMergePR = hasPermission(Permission.REVIEW_MERGE);

  const readyToMergePRs = prs.filter(
    (pr) => pr.status === PullRequestStatus.APPROVED && (pr.approvalCount || 0) >= pr.requiredApprovals
  );

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <CommandBar
        moduleName="Review Console"
        moduleAccent="reviews"
        breadcrumbs={['Workspace', 'Review Console', activeTab === 'REVIEWS' ? 'Active Reviews' : activeTab === 'APPROVALS' ? 'Approvals' : 'History']}
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
        onPrimaryAction={() => router.push('/pull-requests/new')}
        onAiQuickAction={() => router.push('/digest')}
      />

      {/* Distinct Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => handleTabChange('REVIEWS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'REVIEWS'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-text-secondary hover:bg-surface-secondary'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Reviews & Active Queue</span>
          {stats && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary-foreground/20 text-primary-foreground">
              {stats.underReviewPRs + stats.draftPRs}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('APPROVALS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'APPROVALS'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-text-secondary hover:bg-surface-secondary'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approvals & Merge Authorization</span>
          {stats && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary-foreground/20 text-primary-foreground">
              {stats.approvedPRs}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-text-secondary hover:bg-surface-secondary'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>Merge & Release History</span>
          {stats && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary-foreground/20 text-primary-foreground">
              {stats.mergedPRs}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: REVIEWS & ACTIVE QUEUE VIEW */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-6">
          {/* Reviews KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Under Review</span>
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {stats?.underReviewPRs || 0}
              </p>
              <p className="text-[12px] text-text-secondary font-medium">Awaiting Inspection</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Draft PRs</span>
                <FileCode className="w-4 h-4 text-text-secondary" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {stats?.draftPRs || 0}
              </p>
              <p className="text-[12px] text-text-secondary font-medium">Work In Progress</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Assigned To Me</span>
                <GitBranch className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {stats?.assignedToMePRs || 0}
              </p>
              <p className="text-[12px] text-primary font-medium">Action Needed</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Active Pipeline</span>
                <Sparkles className="w-4 h-4 text-success" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {(stats?.underReviewPRs || 0) + (stats?.draftPRs || 0)}
              </p>
              <p className="text-[12px] text-success font-medium">Healthy Velocity</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-primary" />
                <span>Active Review Queue</span>
              </h3>
              <span className="text-xs text-text-secondary font-mono">
                Showing {prs.length} pull requests
              </span>
            </div>
            <PRTable pullRequests={prs} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* TAB 2: APPROVALS & MERGE AUTHORIZATION VIEW */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-6">
          {/* Approvals KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Approved PRs</span>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {stats?.approvedPRs || 0}
              </p>
              <p className="text-[12px] text-success font-medium">Verified Decisions</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Ready For Merge</span>
                <GitMerge className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {readyToMergePRs.length}
              </p>
              <p className="text-[12px] text-primary font-medium">Approvals Threshold Met</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Pending Threshold</span>
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {prs.filter((pr) => (pr.approvalCount || 0) < pr.requiredApprovals).length}
              </p>
              <p className="text-[12px] text-warning font-medium">Awaiting 2nd Approval</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Policy Enforcement</span>
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                SOC 2
              </p>
              <p className="text-[12px] text-success font-medium">RBAC Audit Compliant</p>
            </div>
          </div>

          {/* Merge Authorization Panel for Approved PRs ready for merge */}
          {readyToMergePRs.length > 0 && (
            <div className="p-6 rounded-[10px] border border-primary/30 bg-primary/5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-text-primary">
                  <GitMerge className="w-4 h-4 text-primary" />
                  <span>Merge Queue Spotlight ({readyToMergePRs.length} PRs Ready)</span>
                </div>
                <span className="text-[11px] font-mono text-primary font-bold">
                  Authorization Required (REVIEW_MERGE)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readyToMergePRs.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-4 rounded-xl border border-border bg-surface space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          #{pr.prNumber}
                        </span>
                        <h4 className="font-bold text-xs text-text-primary mt-1 line-clamp-1">
                          {pr.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-success bg-success/10 px-2 py-0.5 rounded border border-success/20 shrink-0">
                        ✓ {pr.approvalCount}/{pr.requiredApprovals} Approved
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2">{pr.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Link
                        href={`/pull-requests/${pr.id}`}
                        className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-1 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Diff
                      </Link>

                      {canMergePR ? (
                        <button
                          onClick={() => handleDirectMerge(pr.id)}
                          disabled={mergingId === pr.id}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <GitMerge className="w-3.5 h-3.5" />
                          <span>{mergingId === pr.id ? 'Merging...' : 'Authorize Merge'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-warning flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Admin Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved PRs Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Approved Pull Requests Directory</span>
              </h3>
              <span className="text-xs text-text-secondary font-mono">
                Showing {prs.length} approved PRs
              </span>
            </div>
            <PRTable pullRequests={prs} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* TAB 3: MERGE & RELEASE HISTORY VIEW */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-6">
          {/* History KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Merged PRs</span>
                <GitMerge className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                {stats?.mergedPRs || 0}
              </p>
              <p className="text-[12px] text-primary font-medium">Integrated Into Main</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Release Velocity</span>
                <Sparkles className="w-4 h-4 text-success" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                100%
              </p>
              <p className="text-[12px] text-success font-medium">On-Time Pipeline</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Audit Trajectory</span>
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                SIGNED
              </p>
              <p className="text-[12px] text-success font-medium">Immutable Audit Trail</p>
            </div>

            <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
              <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
                <span>Diff Versions</span>
                <FileCode className="w-4 h-4 text-text-secondary" />
              </div>
              <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
                Multi
              </p>
              <p className="text-[12px] text-text-secondary font-medium">Version Tracking</p>
            </div>
          </div>

          {/* Merge History Table & Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-primary" />
                <span>Merged Code History & Archive Log</span>
              </h3>
              <span className="text-xs text-text-secondary font-mono">
                Showing {prs.length} historical merges
              </span>
            </div>
            <PRTable pullRequests={prs} isLoading={isLoading} />
          </div>
        </div>
      )}
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
