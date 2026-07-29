import React, { useState } from 'react';
import {
  OrganizationConnectionDto,
  SharedResourceType,
  SharePermission,
} from '@workspace/shared-types';
import { Share2, X, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  connections: OrganizationConnectionDto[];
  onShare: (payload: {
    resourceType: SharedResourceType;
    resourceId: string;
    targetOrganizationId: string;
    permission: SharePermission;
    expiresAt?: string;
  }) => Promise<void>;
  initialResourceType?: SharedResourceType;
  initialResourceId?: string;
}

export function ShareResourceDialog({
  isOpen,
  onClose,
  connections,
  onShare,
  initialResourceType = SharedResourceType.TICKET,
  initialResourceId = '',
}: Props) {
  const [resourceType, setResourceType] = useState<SharedResourceType>(initialResourceType);
  const [resourceId, setResourceId] = useState<string>(initialResourceId);
  const [targetOrgId, setTargetOrgId] = useState<string>(
    connections[0]?.targetOrganizationId || ''
  );
  const [permission, setPermission] = useState<SharePermission>(SharePermission.READ);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId.trim() || !targetOrgId.trim()) {
      setError('Please provide Resource ID and select Target Organization');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onShare({
        resourceType,
        resourceId: resourceId.trim(),
        targetOrganizationId: targetOrgId,
        permission,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to share resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-card rounded-xl border border-border p-6 max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Share Resource Externally
          </h3>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as SharedResourceType)}
              className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
            >
              <option value={SharedResourceType.TICKET}>Support Ticket</option>
              <option value={SharedResourceType.PULL_REQUEST}>Review Pull Request</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
              Target Organization Connection
            </label>
            <select
              value={targetOrgId}
              onChange={(e) => setTargetOrgId(e.target.value)}
              className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
            >
              <option value="">Select connected organization...</option>
              {connections.map((c) => {
                const partnerOrg =
                  c.sourceOrg?.id === c.targetOrganizationId ? c.targetOrg : c.sourceOrg;
                const orgId = partnerOrg?.id || c.targetOrganizationId;
                return (
                  <option key={c.id} value={orgId}>
                    {partnerOrg?.name || 'Connected Org'} (@{partnerOrg?.slug})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
              Resource UUID / ID
            </label>
            <input
              type="text"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="e.g. 4938c19d-f045-4cf0-a485-dc4dfb6370c2"
              className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground font-mono focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
                Access Level
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as SharePermission)}
                className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
              >
                <option value={SharePermission.READ}>READ</option>
                <option value={SharePermission.REVIEW}>REVIEW</option>
                <option value={SharePermission.APPROVE}>APPROVE</option>
                <option value={SharePermission.FULL_ACCESS}>FULL ACCESS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
                Expiration (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Sharing...' : 'Share Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
