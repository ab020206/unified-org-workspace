'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CommandBar } from '@/components/ui/CommandBar';
import { AddMemberModal } from '@/components/ui/AddMemberModal';
import { CredentialHandoverModal } from '@/components/ui/CredentialHandoverModal';
import { Role, OrganizationMemberDto } from '@workspace/shared-types';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import {
  Users,
  UserPlus,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  Power,
  Trash2,
  RefreshCw,
  Key,
} from 'lucide-react';

export default function MembersPage() {
  const { activeOrganization, user } = useAuth();
  const [members, setMembers] = useState<OrganizationMemberDto[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createdMemberData, setCreatedMemberData] = useState<any>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!activeOrganization?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/organizations/${activeOrganization.id}/members`, {
        headers: getAuthHeaders(undefined, activeOrganization.id),
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch {
      setMembers([]);
    }
  }, [activeOrganization?.id]);

  const fetchInvs = useCallback(async () => {
    if (!activeOrganization?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/invitations`, {
        headers: getAuthHeaders(undefined, activeOrganization.id),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setInvitations(data.data);
      } else {
        setInvitations([]);
      }
    } catch {
      setInvitations([]);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    fetchMembers();
    fetchInvs();
  }, [fetchMembers, fetchInvs]);

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    try {
      await fetch(
        `${API_BASE_URL}/organizations/${activeOrganization?.id}/members/${memberId}/role`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(undefined, activeOrganization?.id),
          body: JSON.stringify({ role: newRole }),
        }
      );
      setMessage({ text: `Role updated to ${newRole} successfully.`, type: 'success' });
      fetchMembers();
    } catch {
      setMessage({ text: 'Failed to update member role.', type: 'error' });
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      await fetch(
        `${API_BASE_URL}/organizations/${activeOrganization?.id}/members/${memberId}/status`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(undefined, activeOrganization?.id),
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );
      setMessage({
        text: `Member status toggled to ${!currentStatus ? 'ACTIVE' : 'INACTIVE'}.`,
        type: 'success',
      });
      fetchMembers();
    } catch {
      setMessage({ text: 'Failed to toggle member status.', type: 'error' });
    }
  };

  const handleRemoveMember = async (memberId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove member ${email}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/organizations/${activeOrganization?.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(undefined, activeOrganization?.id),
      });
      setMessage({ text: `Member ${email} removed.`, type: 'success' });
      fetchMembers();
    } catch {
      setMessage({ text: 'Failed to remove member.', type: 'error' });
    }
  };

  const handleResetPassword = async (memberId: string, email: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/organizations/${activeOrganization?.id}/members/${memberId}/reset-password`,
        {
          method: 'POST',
          headers: getAuthHeaders(undefined, activeOrganization?.id),
        }
      );
      const data = await res.json();
      setCreatedMemberData({
        email,
        temporaryPassword: data.data?.temporaryPassword || 'Tmp!Pass12345',
        roleTitle: 'Password Reset',
      });
      setMessage({ text: `Temporary password generated for ${email}.`, type: 'success' });
    } catch {
      setMessage({ text: 'Failed to reset password.', type: 'error' });
    }
  };

  const handleResendInv = async (invId: string) => {
    try {
      await fetch(`${API_BASE_URL}/invitations/${invId}/resend`, {
        method: 'POST',
        headers: getAuthHeaders(undefined, activeOrganization?.id),
      });
      setMessage({ text: 'Invitation resent successfully.', type: 'success' });
      fetchInvs();
    } catch {
      setMessage({ text: 'Failed to resend invitation.', type: 'error' });
    }
  };

  const handleCancelInv = async (invId: string) => {
    try {
      await fetch(`${API_BASE_URL}/invitations/${invId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(undefined, activeOrganization?.id),
      });
      setMessage({ text: 'Invitation cancelled.', type: 'success' });
      fetchInvs();
    } catch {
      setMessage({ text: 'Failed to cancel invitation.', type: 'error' });
    }
  };

  const filteredMembers = members.filter((m) => {
    const query = search.toLowerCase();
    const fullName = `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.toLowerCase();
    const email = m.user?.email?.toLowerCase() || '';
    return (
      fullName.includes(query) || email.includes(query) || m.role.toLowerCase().includes(query)
    );
  });

  const filteredInvitations = invitations.filter((i) => {
    const query = search.toLowerCase();
    return i.email.toLowerCase().includes(query) || i.role.toLowerCase().includes(query);
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Workspace Members & Governance"
        moduleAccent="support"
        breadcrumbs={[activeOrganization?.name || 'Workspace', 'Members Directory']}
        searchPlaceholder="Search members by name, email, or role..."
        primaryActionLabel="Add New Member"
        onPrimaryAction={() => setIsAddModalOpen(true)}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* Header Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>Workspace Membership Governance</span>
          </div>
          <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
            Organization Members & Invitations
          </h2>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Manage workspace members for{' '}
            <strong className="text-text-primary">
              {activeOrganization?.name || 'Current Workspace'}
            </strong>
            , assign RBAC roles, reset credentials, and process invitations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs transition-all shadow-xs flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add / Invite Member
        </button>
      </div>

      {/* Feedback Alert */}
      {message && (
        <div
          className={`p-3 rounded-md border text-xs font-semibold font-mono flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-error/10 border-error/20 text-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="p-5 rounded-[10px] border border-border bg-surface space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Active Members ({filteredMembers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'invitations'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Pending Invitations ({invitations.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-secondary" />
            <input
              type="text"
              placeholder={activeTab === 'members' ? 'Search members...' : 'Search invitations...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* TAB 1: Active Members Table */}
        {activeTab === 'members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-secondary font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMembers.map((m: any) => (
                  <tr key={m.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-text-primary">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground font-bold text-[11px] flex items-center justify-center shadow-xs">
                          {(m.user?.firstName || 'M').substring(0, 1).toUpperCase()}
                        </div>
                        <span>
                          {m.user?.firstName || 'Member'} {m.user?.lastName || ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-text-secondary">
                      {m.user?.email || 'user@demo.com'}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value as Role)}
                        className="bg-surface border border-border text-text-primary font-mono font-medium text-[11px] py-1 px-2 rounded-md focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value={Role.SUPPORT_AGENT}>SUPPORT_AGENT</option>
                        <option value={Role.REVIEWER}>REVIEWER</option>
                        <option value={Role.GUEST}>GUEST</option>
                        <option value={Role.AUDITOR}>AUDITOR</option>
                        <option value={Role.ADMIN}>ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          m.isActive
                            ? 'bg-success/10 border border-success/20 text-success'
                            : 'bg-error/10 border border-error/20 text-error'
                        }`}
                      >
                        {m.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(m.id, m.isActive)}
                        title={m.isActive ? 'Deactivate Member' : 'Activate Member'}
                        className="p-1.5 rounded-md bg-surface hover:bg-surface-secondary text-text-primary border border-border cursor-pointer transition-colors"
                      >
                        <Power
                          className={`w-3.5 h-3.5 ${m.isActive ? 'text-warning' : 'text-success'}`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetPassword(m.id, m.user?.email || '')}
                        title="Reset Password"
                        className="p-1.5 rounded-md bg-surface hover:bg-surface-secondary text-text-primary border border-border cursor-pointer transition-colors"
                      >
                        <Key className="w-3.5 h-3.5 text-primary" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id, m.user?.email || '')}
                        title="Remove Member"
                        className="p-1.5 rounded-md bg-error/10 hover:bg-error/20 text-error border border-error/20 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Pending Invitations Table */}
        {activeTab === 'invitations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-secondary font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Recipient Email</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Invited By</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredInvitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-text-primary font-mono">{inv.email}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-surface-secondary border border-border text-text-primary text-[10px] font-bold">
                        {inv.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-text-primary">{inv.invitedByName}</td>
                    <td className="py-3 px-3 font-mono text-text-secondary text-[11px]">
                      {new Date(inv.expiry).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResendInv(inv.id)}
                        className="px-2.5 py-1 rounded-md bg-surface-secondary hover:bg-surface border border-border text-text-primary font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancelInv(inv.id)}
                        className="px-2.5 py-1 rounded-md bg-error/10 hover:bg-error/20 border border-error/20 text-error font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(data) => {
          setCreatedMemberData(data);
          fetchInvs();
        }}
      />

      {/* Credential Handover Modal */}
      <CredentialHandoverModal
        isOpen={Boolean(createdMemberData)}
        onClose={() => setCreatedMemberData(null)}
        data={createdMemberData}
      />
    </div>
  );
}
