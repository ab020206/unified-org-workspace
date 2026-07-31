'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Share2,
  Ticket,
  GitPullRequest,
  Lock,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export function GuestDashboard() {
  const router = useRouter();
  const { user, activeOrganization } = useAuth();
  const [shares, setShares] = useState<any[]>([]);

  useEffect(() => {
    if (!activeOrganization?.id) return;
    fetch(`${API_BASE_URL}/sharing`, {
      headers: getAuthHeaders(undefined, activeOrganization.id),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const owned = data.data.ownedShares || [];
          const received = data.data.receivedShares || [];
          setShares([...owned, ...received]);
        }
      })
      .catch((err) => console.error('Error fetching guest shared items:', err));
  }, [activeOrganization?.id]);

  const sharedTicketsCount = shares.filter((s) => s.resourceType === 'TICKET').length;
  const sharedReviewsCount = shares.filter((s) => s.resourceType === 'PULL_REQUEST').length;
  const totalShared = shares.length;

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <CommandBar
        moduleName="Guest Partner Collaboration Portal"
        moduleAccent="collaboration"
        breadcrumbs={['Partner Portal', 'Shared Resources']}
        searchPlaceholder="Search shared ticket IDs, shared reviews, or partner comments..."
        primaryActionLabel="View Shared Items"
        onPrimaryAction={() => router.push('/collaboration')}
      />

      {/* Personalized Welcome Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Role: Guest Collaborator</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
          Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Guest User'}
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Secure partner workspace. You have access to{' '}
          <strong className="text-primary font-mono">{totalShared} shared resources</strong> (
          <strong className="text-text-primary font-mono">
            {sharedTicketsCount} shared tickets
          </strong>{' '}
          and{' '}
          <strong className="text-text-primary font-mono">
            {sharedReviewsCount} shared reviews
          </strong>
          ) granted by host organizations.
        </p>
      </div>

      {/* Guest KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Shared Tickets</span>
            <Ticket className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {sharedTicketsCount}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Partner Support Items</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Shared Reviews</span>
            <GitPullRequest className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {sharedReviewsCount}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">External Code Reviews</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Total Shared</span>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {totalShared}
          </p>
          <p className="text-[13px] text-warning font-medium">Available Resources</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Access Mode</span>
            <Lock className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            Scoped
          </p>
          <p className="text-[13px] text-success font-medium">Read & Comment Only</p>
        </div>
      </div>

      {/* Main Guest Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shared Resources Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <Share2 className="w-4 h-4 text-primary" />
                <span>Shared Resources Console</span>
              </div>
              <Link
                href="/sharing"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                Explore All Shares <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {totalShared === 0 ? (
              <EmptyState
                title="No shared resources found."
                description="No cross-organization tickets or review files have been shared with your partner account yet."
                icon={<Share2 className="w-6 h-6 text-text-secondary" />}
              />
            ) : (
              <div className="space-y-3">
                {shares.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-md bg-surface-secondary/50 border border-border flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface text-text-primary border border-border">
                          {s.resourceType}
                        </span>
                        <span className="text-[11px] font-mono text-text-secondary">
                          Shared by: {s.sourceOrganization?.name || 'Partner Org'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-text-primary">
                        Resource #{s.resourceId?.substring(0, 8)}
                      </h4>
                    </div>
                    <Link
                      href="/sharing"
                      className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-medium transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      View <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Partner Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-mono text-xs text-text-secondary uppercase tracking-wider font-medium">
              Guest Partner Actions
            </h4>
            <div className="space-y-2">
              <Link
                href="/collaboration"
                className="w-full py-2.5 px-3.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>Open Shared Ticket</span>
                <Ticket className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/collaboration?tab=comments"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Add Comment to Shared Item</span>
                <MessageSquare className="w-3.5 h-3.5 text-text-secondary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
