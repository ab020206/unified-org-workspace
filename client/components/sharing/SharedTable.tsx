import React from 'react';
import Link from 'next/link';
import { SharedResourceDto, SharedResourceType } from '@workspace/shared-types';
import { SharedBadge } from './SharedBadge';
import { Share2, Ticket, GitPullRequest, Building2, ExternalLink, Trash2 } from 'lucide-react';

interface Props {
  shares: SharedResourceDto[];
  isOutgoing?: boolean;
  onRevoke?: (shareId: string) => void;
}

export function SharedTable({ shares, isOutgoing = false, onRevoke }: Props) {
  if (shares.length === 0) {
    return (
      <div className="forge-panel p-8 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-surface-secondary text-text-primary mx-auto flex items-center justify-center font-bold border border-border">
          <Share2 className="w-5 h-5" />
        </div>
        <p className="text-xs text-text-secondary font-medium">No shared resources found in this feed.</p>
      </div>
    );
  }

  return (
    <div className="forge-panel overflow-x-auto shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-surface-secondary/50 border-b border-border sticky top-0 font-mono">
          <tr className="text-text-secondary uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Resource</th>
            <th className="py-3 px-4">{isOutgoing ? 'Shared With' : 'Owner Org'}</th>
            <th className="py-3 px-4">Permission</th>
            <th className="py-3 px-4">Expires</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium">
          {shares.map((share) => {
            const org = isOutgoing ? share.sharedWithOrg : share.ownerOrg;
            const linkHref =
              share.resourceType === SharedResourceType.TICKET
                ? `/tickets/${share.resourceId}`
                : `/pull-requests/${share.resourceId}`;

            return (
              <tr
                key={share.id}
                className="hover:bg-surface-secondary/40 transition-colors group"
              >
                <td className="py-3 px-4">
                  <Link href={linkHref} className="block">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-surface-secondary text-text-primary border border-border flex items-center gap-1">
                        {share.resourceType === SharedResourceType.TICKET ? (
                          <>
                            <Ticket className="w-3 h-3 text-text-secondary" /> Ticket
                          </>
                        ) : (
                          <>
                            <GitPullRequest className="w-3 h-3 text-text-secondary" /> PR
                          </>
                        )}
                      </span>
                      <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {share.resourceDetails?.title ||
                          `ID: ${share.resourceId.substring(0, 8)}...`}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="py-3 px-4 text-xs font-semibold text-text-primary">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{org?.name || 'Organization'}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <SharedBadge permission={share.permission} />
                </td>
                <td className="py-3 px-4 text-xs text-text-secondary font-mono">
                  {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={linkHref}
                      className="p-1 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    {isOutgoing && onRevoke && (
                      <button
                        type="button"
                        onClick={() => onRevoke(share.id)}
                        className="p-1 rounded text-error hover:bg-error/10 transition-colors cursor-pointer"
                        title="Revoke Share"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
