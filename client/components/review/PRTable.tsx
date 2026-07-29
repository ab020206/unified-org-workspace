'use client';

import React from 'react';
import Link from 'next/link';
import { PullRequestDto } from '@workspace/shared-types';
import { PRStatusBadge } from './PRStatusBadge';
import { ApprovalCounter } from './ApprovalCounter';
import { useInspector } from '@/providers/InspectorProvider';
import { Eye, ExternalLink } from 'lucide-react';

interface Props {
  pullRequests: PullRequestDto[];
  isLoading?: boolean;
}

export function PRTable({ pullRequests, isLoading }: Props) {
  const { openInspector } = useInspector();

  if (isLoading) {
    return (
      <div className="forge-panel forge-accent-reviews p-6 text-center animate-pulse">
        <div className="h-6 bg-surface-secondary rounded w-1/4 mb-4 mx-auto" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-surface-secondary/60 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (pullRequests.length === 0) {
    return (
      <div className="forge-panel forge-accent-reviews p-12 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-surface-secondary text-text-primary mx-auto flex items-center justify-center font-bold font-mono border border-border">
          PR
        </div>
        <h3 className="text-sm font-bold text-text-primary">No Pull Requests found</h3>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          No pull requests match your search query or status filter. Create a new pull request to start reviewing.
        </p>
      </div>
    );
  }

  return (
    <div className="forge-panel forge-accent-reviews overflow-x-auto shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-surface-secondary/50 border-b border-border sticky top-0 font-mono">
          <tr className="text-text-secondary uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Pull Request</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Author</th>
            <th className="py-3 px-4">Approvals</th>
            <th className="py-3 px-4">Reviewers</th>
            <th className="py-3 px-4 text-right">Updated</th>
            <th className="py-3 px-4 text-right">Inspect</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium">
          {pullRequests.map((pr) => (
            <tr
              key={pr.id}
              onClick={() => openInspector('pull-request', pr)}
              className="hover:bg-surface-secondary/60 transition-colors group cursor-pointer"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-text-primary bg-surface-secondary px-2 py-0.5 rounded border border-border">
                    #{pr.prNumber}
                  </span>
                  <span className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {pr.title}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <PRStatusBadge status={pr.status} size="sm" />
              </td>
              <td className="py-3 px-4 text-xs text-text-secondary">
                {pr.creator ? `${pr.creator.firstName} ${pr.creator.lastName}` : 'User'}
              </td>
              <td className="py-3 px-4">
                <ApprovalCounter
                  approvedCount={pr.approvalCount || 0}
                  requiredApprovals={pr.requiredApprovals}
                  size="sm"
                />
              </td>
              <td className="py-3 px-4">
                <div className="flex -space-x-1 overflow-hidden">
                  {pr.reviewers && pr.reviewers.length > 0 ? (
                    pr.reviewers.map((r) => (
                      <span
                        key={r.id}
                        className="inline-block h-5 w-5 rounded-full bg-surface-secondary text-text-primary font-bold text-[9px] flex items-center justify-center border border-border"
                        title={r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : ''}
                      >
                        {r.reviewer ? r.reviewer.firstName[0] : 'R'}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-text-secondary">None assigned</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right text-xs text-text-secondary font-mono">
                {new Date(pr.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openInspector('pull-request', pr)}
                    className="p-1 rounded hover:bg-surface-secondary text-text-secondary hover:text-primary transition-colors cursor-pointer"
                    title="Slide-Over Inspector"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/pull-requests/${pr.id}`}
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
