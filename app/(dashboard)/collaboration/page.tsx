'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collaborationApi } from '@/lib/collaborationApi';
import {
  OrganizationConnectionDto,
  SharedResourcesFeedDto,
  CreateShareDto,
} from '@workspace/shared-types';
import { ConnectionCard } from '@/components/sharing/ConnectionCard';
import { SharedTable } from '@/components/sharing/SharedTable';
import { ShareResourceDialog } from '@/components/sharing/ShareResourceDialog';
import { Share2, Plus, Building2 } from 'lucide-react';

export default function CollaborationPage() {
  const { activeOrganization } = useAuth();
  const [feed, setFeed] = useState<SharedResourcesFeedDto | null>(null);
  const [allConnections, setAllConnections] = useState<OrganizationConnectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING' | 'CONNECTIONS'>(
    'CONNECTIONS'
  );
  const [connectInput, setConnectInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeOrganization?.id) return;
    setIsLoading(true);
    try {
      const [feedData, connData] = await Promise.all([
        collaborationApi.getDashboard(activeOrganization.id),
        collaborationApi.getConnections(activeOrganization.id),
      ]);
      setFeed(feedData);
      setAllConnections(connData);
    } catch (err) {
      console.error('Failed to load collaboration data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !activeOrganization?.id) return;
    setIsConnecting(true);
    try {
      await collaborationApi.requestConnection(
        { targetOrganizationIdOrSlug: connectInput.trim() },
        activeOrganization.id
      );
      setConnectInput('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAcceptConnection = async (id: string) => {
    try {
      await collaborationApi.acceptConnection(id, activeOrganization?.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept connection');
    }
  };

  const handleRejectConnection = async (id: string) => {
    try {
      await collaborationApi.rejectConnection(id, activeOrganization?.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject connection');
    }
  };

  const handleDisconnect = async (id: string) => {
    if (
      !confirm(
        'Revoke connection with this organization? Existing resource shares will no longer be accessible.'
      )
    )
      return;
    try {
      await collaborationApi.disconnect(id, activeOrganization?.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect');
    }
  };

  const handleShareResource = async (data: CreateShareDto) => {
    await collaborationApi.createShare(data, activeOrganization?.id);
    await loadData();
  };

  const handleRevokeShare = async (shareId: string) => {
    if (!confirm('Revoke resource share? Guest organization will immediately lose access.')) return;
    try {
      await collaborationApi.revokeShare(shareId, activeOrganization?.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke share');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            Cross-Organization Collaboration
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Establish trusted connections and share resources for{' '}
            <span className="font-semibold text-primary">{activeOrganization?.name}</span>
          </p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Share Resource Externally</span>
        </button>
      </div>

      {/* Connect Box */}
      <div className="forge-panel p-6 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          Connect to an External Organization
        </h3>
        <p className="text-xs text-gray-400">
          Enter the Organization ID or Organization Slug to send a trusted connection request.
        </p>

        <form onSubmit={handleRequestConnection} className="flex gap-2 max-w-xl">
          <input
            type="text"
            required
            value={connectInput}
            onChange={(e) => setConnectInput(e.target.value)}
            placeholder="Organization Slug or UUID (e.g. acme-corp)..."
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isConnecting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {isConnecting ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('CONNECTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CONNECTIONS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Trusted Connections ({allConnections.length})
        </button>
        <button
          onClick={() => setActiveTab('INCOMING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'INCOMING'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Shared With My Org ({feed?.incomingShares.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('OUTGOING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'OUTGOING'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Shared By My Org ({feed?.outgoingShares.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="p-8 text-center animate-pulse text-xs text-gray-400">
          Loading collaboration data...
        </div>
      ) : (
        <>
          {activeTab === 'CONNECTIONS' && (
            <div className="space-y-4">
              {allConnections.length === 0 ? (
                <div className="forge-panel p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    No connections requested or accepted yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allConnections.map((c) => (
                    <ConnectionCard
                      key={c.id}
                      connection={c}
                      currentOrgId={activeOrganization?.id || ''}
                      onAccept={() => handleAcceptConnection(c.id)}
                      onReject={() => handleRejectConnection(c.id)}
                      onDisconnect={() => handleDisconnect(c.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'INCOMING' && (
            <SharedTable shares={feed?.incomingShares || []} isOutgoing={false} />
          )}

          {activeTab === 'OUTGOING' && (
            <SharedTable
              shares={feed?.outgoingShares || []}
              isOutgoing={true}
              onRevoke={handleRevokeShare}
            />
          )}
        </>
      )}

      {/* Share Modal Dialog */}
      <ShareResourceDialog
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        connections={feed?.connections || []}
        onShare={handleShareResource}
      />
    </div>
  );
}
