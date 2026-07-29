'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ProtectedLayoutPlaceholder } from '@/components/ProtectedLayoutPlaceholder';
import { useAuth } from '@/context/AuthContext';
import { Role, Permission } from '@workspace/shared-types';

export default function InviteMemberPage() {
  const { activeOrganization, inviteMember } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.GUEST);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await inviteMember({ email, role });
      setSuccess(`Invitation sent to ${email} as ${role}`);
      setEmail('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send invitation';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayoutPlaceholder permission={Permission.ORG_INVITE}>
      <div className="max-w-xl mx-auto space-y-6 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Invite Team Member</h1>
              <p className="text-xs text-muted-foreground">
                Invite a new member to join{' '}
                <strong className="text-foreground">{activeOrganization?.name}</strong>
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4"
        >
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              {success}
            </div>
          )}

          <FormInput
            label="Member Email Address"
            type="email"
            placeholder="colleague@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground/90">
              Organization Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value={Role.GUEST}>GUEST — Read only access</option>
              <option value={Role.REVIEWER}>REVIEWER — Review access</option>
              <option value={Role.SUPPORT_AGENT}>SUPPORT_AGENT — Support hub access</option>
              <option value={Role.ADMIN}>ADMIN — Full administrative control</option>
            </select>
          </div>

          <div className="pt-2">
            <LoadingButton type="submit" isLoading={isLoading} className="w-full">
              Send Invitation
            </LoadingButton>
          </div>
        </form>
      </div>
    </ProtectedLayoutPlaceholder>
  );
}
