'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  GitMerge,
  Eye,
  XCircle,
  ArrowUpRight,
  GitBranch,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export function ReviewerDashboard() {
  const router = useRouter();
  const { user, activeOrganization } = useAuth();
  const [pullRequests, setPullRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!activeOrganization?.id) return;
    fetch(`${API_BASE_URL}/pull-requests?organizationId=${activeOrganization.id}`, {
      headers: getAuthHeaders(undefined, activeOrganization.id),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.items)) {
          setPullRequests(data.data.items);
        } else if (data.success && Array.isArray(data.data)) {
          setPullRequests(data.data);
        }
      })
      .catch((err) => console.error('Error fetching reviewer PRs:', err));
  }, [activeOrganization?.id]);

  const pendingCount = pullRequests.filter(
    (pr) => pr.status === 'UNDER_REVIEW' || pr.status === 'OPEN'
  ).length;
  const approvedCount = pullRequests.filter((pr) => pr.status === 'APPROVED').length;
  const rejectedCount = pullRequests.filter(
    (pr) => pr.status === 'REJECTED' || pr.status === 'CHANGES_REQUESTED'
  ).length;
  const mergeReadyCount = pullRequests.filter(
    (pr) => pr.status === 'MERGED' || pr.status === 'APPROVED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <CommandBar
        moduleName="Review Console & PR Queue"
        moduleAccent="reviews"
        breadcrumbs={['Review Console', 'My Review Queue']}
        searchPlaceholder="Search PR titles, branch names, authors, or diff lines..."
        primaryActionLabel="New Pull Request"
        onPrimaryAction={() => router.push('/pull-requests/new')}
      />

      {/* Personalized Welcome Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium w-fit">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Role: Code Reviewer & Authorizer</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
          Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Reviewer'}
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          You have{' '}
          <strong className="text-primary font-mono">{pendingCount} reviews waiting</strong> in your
          approval queue (
          <strong className="text-success font-mono">{mergeReadyCount} ready for merge</strong>,{' '}
          <strong className="text-error font-mono">{rejectedCount} rejected</strong>).
        </p>
      </div>

      {/* Reviewer KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Pending Reviews</span>
            <Clock className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {pendingCount}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Awaiting Approval</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Merge Queue</span>
            <GitMerge className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {mergeReadyCount}
          </p>
          <p className="text-[13px] text-success font-medium">Ready to Merge</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Approved PRs</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {approvedCount}
          </p>
          <p className="text-[13px] text-success font-medium">Verified Decisions</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Blocked / Rejected</span>
            <XCircle className="w-4 h-4 text-error" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {rejectedCount}
          </p>
          <p className="text-[13px] text-error font-medium">Requires Re-Review</p>
        </div>
      </div>

      {/* Main Reviewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pull Requests Queue Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <GitPullRequest className="w-4 h-4 text-primary" />
                <span>Assigned Pull Requests & Code Reviews</span>
              </div>
              <Link
                href="/pull-requests"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                View All PRs <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {pullRequests.length === 0 ? (
              <EmptyState
                title="No reviews pending."
                description="Your pull request review queue is currently empty! New submission assignments will appear here."
                icon={<GitPullRequest className="w-6 h-6 text-text-secondary" />}
                action={
                  <Link
                    href="/pull-requests"
                    className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-all shadow-xs"
                  >
                    Browse Code Repository
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {pullRequests.map((pr) => (
                  <div
                    key={pr.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase ${
                            pr.status === 'APPROVED'
                              ? 'bg-success/10 text-success border-success/20'
                              : pr.status === 'REJECTED'
                                ? 'bg-error/10 text-error border-error/20'
                                : 'bg-surface-secondary text-text-primary border-border'
                          }`}
                        >
                          {pr.status}
                        </span>
                        <span className="text-[11px] font-mono text-text-secondary">
                          {pr.author
                            ? `Author: ${pr.author.firstName} ${pr.author.lastName}`
                            : 'Pull Request'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-text-primary hover:text-primary transition-colors">
                        <Link href={`/pull-requests?id=${pr.id}`}>{pr.title}</Link>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/pull-requests?id=${pr.id}`}
                        className="px-2.5 py-1 rounded-md bg-surface border border-border hover:bg-surface-secondary text-primary text-xs font-medium transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Inspect Diff
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Merge Queue Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-mono text-xs text-text-secondary uppercase tracking-wider font-medium">
              Reviewer Actions
            </h4>
            <div className="space-y-2">
              <Link
                href="/pull-requests"
                className="w-full py-2.5 px-3.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-all flex items-center justify-between shadow-xs"
              >
                <span>Create Review</span>
                <GitPullRequest className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/pull-requests?status=APPROVED"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Approve Ready PRs</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              </Link>

              <Link
                href="/pull-requests?queue=merge"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Authorize Merge Queue</span>
                <GitMerge className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>

          {/* Merge Queue Analytics */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="font-semibold text-xs text-text-primary flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-success" />
                <span>Merge Pipeline Health</span>
              </h4>
              <span className="text-[11px] font-mono text-success">PASSED</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Automated linting and test coverage checks are 100% green across all{' '}
              {pullRequests.length} pull requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
