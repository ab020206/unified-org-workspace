import React from 'react';
import { OrganizationConnectionDto, OrganizationConnectionStatus } from '@workspace/shared-types';
import { Building2, Check, X, Unlink } from 'lucide-react';

interface Props {
  connection: OrganizationConnectionDto;
  currentOrgId: string;
  onAccept?: () => void;
  onReject?: () => void;
  onDisconnect?: () => void;
}

export function ConnectionCard({
  connection,
  currentOrgId,
  onAccept,
  onReject,
  onDisconnect,
}: Props) {
  const isIncoming = connection.targetOrganizationId === currentOrgId;
  const partnerOrg = isIncoming ? connection.sourceOrg : connection.targetOrg;
  const isPending = connection.status === OrganizationConnectionStatus.PENDING;
  const isAccepted = connection.status === OrganizationConnectionStatus.ACCEPTED;

  const getStatusBadge = () => {
    switch (connection.status) {
      case OrganizationConnectionStatus.ACCEPTED:
        return 'bg-success/10 text-success border-success/20';
      case OrganizationConnectionStatus.PENDING:
        return 'bg-warning/10 text-warning border-warning/20';
      case OrganizationConnectionStatus.REJECTED:
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-surface-secondary text-text-secondary border-border';
    }
  };

  return (
    <div className="p-5 rounded-md border border-border bg-surface shadow-xs flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-surface-secondary text-primary flex items-center justify-center border border-border">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">
              {partnerOrg?.name || 'Organization'}
            </h4>
            <p className="text-xs text-text-secondary font-mono">@{partnerOrg?.slug || 'slug'}</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded border ${getStatusBadge()}`}
        >
          {connection.status}
        </span>
      </div>

      <div className="text-xs text-text-secondary pt-2 border-t border-border flex items-center justify-between">
        <span>
          {isIncoming ? 'Incoming Request from' : 'Requested by'}:{' '}
          <span className="font-semibold text-text-primary">
            {connection.requester
              ? `${connection.requester.firstName} ${connection.requester.lastName}`
              : 'User'}
          </span>
        </span>
        <span className="font-mono text-[10px]">
          {new Date(connection.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {isPending && isIncoming && onAccept && onReject && (
          <>
            <button
              type="button"
              onClick={onReject}
              className="px-3 py-1.5 rounded-md border border-border bg-surface-secondary text-text-primary text-xs font-medium hover:bg-surface flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Connection</span>
            </button>
          </>
        )}

        {isAccepted && onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-3 py-1.5 rounded-md border border-error/20 bg-error/10 text-error text-xs font-medium hover:bg-error/20 flex items-center gap-1 cursor-pointer"
          >
            <Unlink className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        )}
      </div>
    </div>
  );
}
