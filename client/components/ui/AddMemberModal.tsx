'use client';

import React, { useState } from 'react';
import { FormInput } from '@/components/ui/FormInput';
import { Role } from '@workspace/shared-types';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { UserPlus, X, Key, Mail, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (handoverData: any) => void;
}

export function AddMemberModal({ isOpen, onClose, onSuccess }: Props) {
  const { activeOrganization } = useAuth();

  const [authMode, setAuthMode] = useState<'DIRECT' | 'INVITATION'>('DIRECT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>(Role.SUPPORT_AGENT);
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let res = 'Tmp!';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization?.id) return;
    setError('');
    setIsLoading(true);

    try {
      const headers = getAuthHeaders(undefined, activeOrganization.id);
      if (authMode === 'DIRECT') {
        const payload = {
          firstName,
          lastName,
          email,
          phone,
          role,
          temporaryPassword: password || undefined,
        };

        const res = await fetch(`${API_BASE_URL}/organizations/${activeOrganization.id}/members`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to add member');

        onSuccess({
          member: data.data?.member || data.data,
          temporaryPassword: data.data?.temporaryPassword || password,
          roleTitle: role,
        });
      } else {
        const res = await fetch(`${API_BASE_URL}/invitations`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ email, role, organizationId: activeOrganization.id }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to send invitation');

        onSuccess({
          invitationToken: data.data?.token || 'INVITE_LINK_GENERATED',
          roleTitle: role,
          email,
        });
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[10px] border border-border bg-surface p-6 shadow-lg space-y-5 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-text-primary">Add Workspace Member</h3>
              <p className="text-xs text-text-secondary">Provision user account & assign RBAC permissions</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-xs font-mono">
              {error}
            </div>
          )}

          {/* Auth Flow Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
              Authentication & Credentials Flow
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-md bg-surface-secondary border border-border">
              <button
                type="button"
                onClick={() => setAuthMode('DIRECT')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'DIRECT'
                    ? 'bg-surface text-text-primary shadow-xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Direct Credentials</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('INVITATION')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'INVITATION'
                    ? 'bg-surface text-text-primary shadow-xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email Invitation</span>
              </button>
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="First Name *"
              placeholder="Rohan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <FormInput
              label="Last Name *"
              placeholder="Gupta"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <div className="sm:col-span-2">
              <FormInput
                label="User Email Address *"
                placeholder="user@workspace.demo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <FormInput
                label="Phone Number (Optional)"
                placeholder="+1 555-0199"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Role Dropdown */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Assigned RBAC Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-md border border-border bg-surface p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value={Role.SUPPORT_AGENT}>SUPPORT_AGENT (Customer Support & Ticket Resolver)</option>
                <option value={Role.REVIEWER}>REVIEWER (Peer Code Reviewer & Approver)</option>
                <option value={Role.GUEST}>GUEST (External Partner & Shared Resource Collaborator)</option>
                <option value={Role.AUDITOR}>AUDITOR (Compliance & Audit Log Observer - Read Only)</option>
                <option value={Role.ADMIN}>ADMIN (Workspace Administrator & User Governance)</option>
              </select>
              <p className="text-[11px] text-text-secondary pt-0.5">
                {role === Role.SUPPORT_AGENT && 'Access to support tickets queue, status updates, comments & attachments.'}
                {role === Role.REVIEWER && 'Access to pull request review console, approvals, and merges.'}
                {role === Role.GUEST && 'Access to cross-tenant shared resources and guest workspace view.'}
                {role === Role.AUDITOR && 'Read-only access to organization audit logs and compliance timeline.'}
                {role === Role.ADMIN && 'Full access to organization members, settings, and workspace governance.'}
              </p>
            </div>

            {authMode === 'DIRECT' && (
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                    Temporary Password (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate Password
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Leave blank for auto-generated temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-border bg-surface-secondary hover:bg-surface text-xs font-medium text-text-primary transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Member...' : 'Create Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
