'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Users,
  Ticket,
  GitPullRequest,
  Activity,
  Mail,
  Share2,
  CheckCircle2,
  Clock,
  UserPlus,
  Settings,
  Sparkles,
  ArrowUpRight,
  Send,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export function OrgAdminDashboard() {
  const router = useRouter();
  const { user, activeOrganization } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);

  const fetchDashboardData = () => {
    if (!activeOrganization?.id) return;
    const headers = getAuthHeaders(undefined, activeOrganization.id);

    fetch(`${API_BASE_URL}/organizations/${activeOrganization.id}/members`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMembers(data.data || []);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/tickets?organizationId=${activeOrganization.id}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTickets(data.data?.tickets || []);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/pull-requests?organizationId=${activeOrganization.id}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPullRequests(data.data?.items || []);
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/sharing`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const owned = data.data?.ownedShares || [];
          const received = data.data?.receivedShares || [];
          setSharedItems([...owned, ...received]);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/invitations`, { headers })
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success && Array.isArray(data.data)) setInvitations(data.data);
        else setInvitations([]);
      })
      .catch(() => setInvitations([]));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeOrganization?.id]);

  const handleRevokeInv = async (invId: string) => {
    try {
      await fetch(`${API_BASE_URL}/invitations/${invId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(undefined, activeOrganization?.id),
      });
      setInvitations((prev) => prev.filter((i) => i.id !== invId));
    } catch (err) {
      console.error('Failed to revoke invitation:', err);
    }
  };

  const activeMemberCount = members?.length || 0;
  const supportAgentsCount = members?.filter((m) => m.role === 'SUPPORT_AGENT').length || 0;
  const reviewersCount = members?.filter((m) => m.role === 'REVIEWER').length || 0;
  const orgAdminsCount = members?.filter((m) => m.role === 'ADMIN').length || 0;
  const guestsAuditorsCount =
    members?.filter((m) => m.role === 'GUEST' || m.role === 'AUDITOR').length || 0;

  const openTicketsCount = tickets.filter(
    (t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED'
  ).length;
  const openPRsCount = pullRequests.filter((pr) => pr.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <CommandBar
        moduleName="Organization Admin Hub"
        moduleAccent="support"
        breadcrumbs={[activeOrganization?.name || 'Organization', 'Workspace Management']}
        searchPlaceholder="Search members, tickets, pending invitations, or security policies..."
        primaryActionLabel="Add / Invite Member"
        onPrimaryAction={() => router.push('/members')}
        onAiQuickAction={() => router.push('/digest')}
      />

      {/* Personalized Welcome Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span>Tenant Workspace: {activeOrganization?.name || 'Active Workspace'}</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
          Welcome,{' '}
          {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Workspace Admin'}
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Managing{' '}
          <strong className="text-text-primary">
            {activeOrganization?.name || 'Active Workspace'}
          </strong>
          . You currently have{' '}
          <strong className="text-primary font-mono">{activeMemberCount} Active Members</strong> and{' '}
          <strong className="text-warning font-mono">
            {invitations.length} Pending Invitations
          </strong>
          .
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Org Health</span>
            <Activity className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            100%
          </p>
          <p className="text-[13px] text-success font-medium">Active Status</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Members</span>
            <Users className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {activeMemberCount}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Active Members</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Pending Invites</span>
            <Mail className="w-4 h-4 text-warning" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {invitations.length}
          </p>
          <p className="text-[13px] text-warning font-medium">Invitations Sent</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Open Tickets</span>
            <Ticket className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {openTicketsCount}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">
            {tickets.length} Total Tickets
          </p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Open PRs</span>
            <GitPullRequest className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {openPRsCount}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">
            {pullRequests.length} Total PRs
          </p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Shared Items</span>
            <Share2 className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">
            {sharedItems.length}
          </p>
          <p className="text-[13px] text-text-secondary font-medium">Cross-Tenant Shares</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Breakdown & Pending Invitations Manager */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department & Role Statistics */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <Users className="w-4 h-4 text-primary" />
                <span>Department Statistics & Member Distribution</span>
              </div>
              <Link
                href="/members"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                Manage Directory <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">
                  Support Agents
                </span>
                <p className="text-lg font-semibold text-text-primary font-mono">
                  {supportAgentsCount} Members
                </p>
              </div>

              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">
                  Code Reviewers
                </span>
                <p className="text-lg font-semibold text-text-primary font-mono">
                  {reviewersCount} Members
                </p>
              </div>

              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">
                  Org Admins
                </span>
                <p className="text-lg font-semibold text-text-primary font-mono">
                  {orgAdminsCount} Members
                </p>
              </div>

              <div className="p-3 rounded-md bg-surface-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase">
                  Guests & Auditors
                </span>
                <p className="text-lg font-semibold text-success font-mono">
                  {guestsAuditorsCount} Members
                </p>
              </div>
            </div>
          </div>

          {/* Pending Invitations Manager */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <Mail className="w-4 h-4 text-warning" />
                <span>Pending Invitations Manager</span>
              </div>
              <Link
                href="/members"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                + Add / Invite Member
              </Link>
            </div>

            {invitations.length === 0 ? (
              <EmptyState
                title="No invitations pending."
                description="All member invitations for your organization have been accepted or processed."
                icon={<Mail className="w-6 h-6 text-text-secondary" />}
                action={
                  <Link
                    href="/members"
                    className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-all shadow-xs"
                  >
                    Add / Invite Member
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {invitations.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-surface-secondary border border-border text-primary flex items-center justify-center font-bold text-xs">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-text-primary">{inv.email}</h4>
                        <p className="text-[11px] font-mono text-text-secondary">
                          Role: <span className="text-text-primary font-semibold">{inv.role}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-secondary" /> Expiry:{' '}
                        {new Date(inv.expiry).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleRevokeInv(inv.id)}
                        className="p-1.5 rounded hover:bg-error/10 text-text-secondary hover:text-error transition-colors cursor-pointer"
                        title="Revoke invitation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Shared Resources Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-mono text-xs text-text-secondary uppercase tracking-wider font-medium">
              Organization Admin Actions
            </h4>
            <div className="space-y-2">
              <Link
                href="/members"
                className="w-full py-2.5 px-3.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>Add / Invite Member</span>
                <UserPlus className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/settings"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Organization Settings</span>
                <Settings className="w-3.5 h-3.5 text-text-secondary" />
              </Link>

              <Link
                href="/digest"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Generate Executive Report</span>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>

          {/* Shared Resources Summary */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="font-semibold text-xs text-text-primary flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <span>Shared Resources</span>
              </h4>
              <Link
                href="/sharing"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                View Shares
              </Link>
            </div>
            {sharedItems.length === 0 ? (
              <p className="text-xs text-text-secondary leading-relaxed">
                No active cross-tenant tickets or review resources currently shared.
              </p>
            ) : (
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-primary font-mono">
                  {sharedItems.length} active cross-tenant resources
                </strong>{' '}
                shared between partner organizations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
