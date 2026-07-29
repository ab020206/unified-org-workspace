'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CommandBar } from '@/components/ui/CommandBar';
import {
  Building2,
  Users,
  Key,
  ShieldCheck,
  Save,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Globe,
  Lock,
} from 'lucide-react';
import { Role } from '@workspace/shared-types';

export default function SettingsPage() {
  const { activeOrganization, members, updateOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'apikeys' | 'security'>(
    'profile'
  );

  // Form states
  const [orgName, setOrgName] = useState(activeOrganization?.name || '');
  const [orgSlug, setOrgSlug] = useState(activeOrganization?.slug || '');
  const [customDomain, setCustomDomain] = useState(
    activeOrganization?.slug ? `app.${activeOrganization.slug}.com` : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key-1',
      name: 'Production CI/CD Pipeline',
      prefix: 'uw_live_8f3a...',
      created: '2026-06-15',
      status: 'ACTIVE',
    },
    {
      id: 'key-2',
      name: 'Audit Log Export Worker',
      prefix: 'uw_live_1c9b...',
      created: '2026-07-01',
      status: 'ACTIVE',
    },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Security preferences
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('24h');
  const [auditRetention, setAuditRetention] = useState('365d');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;
    setError('');
    setIsSaving(true);
    try {
      await updateOrganization(activeOrganization.id, {
        name: orgName,
        slug: orgSlug,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update organization details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `uw_live_${Math.random().toString(36).substring(2, 8)}...`,
      created: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    };
    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleCopyKey = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Context Command Bar */}
      <CommandBar
        moduleName="Workspace Settings"
        moduleAccent="security"
        breadcrumbs={['Workspace', 'Settings & Governance']}
        searchPlaceholder="Search workspace settings, API keys, or security rules..."
        primaryActionLabel="Invite Member"
        onPrimaryAction={() => (window.location.href = '/organizations/invite')}
      />

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'team'
              ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team & Roles ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('apikeys')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'apikeys'
              ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Keys & Secrets</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Compliance</span>
        </button>
      </div>

      {/* TAB 1: Organization Profile */}
      {activeTab === 'profile' && (
        <div className="panel-card module-accent-security p-6 max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Organization General Info</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update organization branding, unique identifier slug, and custom domain routing.
            </p>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2 font-mono">
              <Check className="w-4 h-4" />
              <span>Organization settings saved successfully.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
                Organization Display Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
                Organization Slug (URL Identifier)
              </label>
              <input
                type="text"
                required
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
                Custom Enterprise Domain
              </label>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-card p-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Team & Roles */}
      {activeTab === 'team' && (
        <div className="panel-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Team Member Roles & Access</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage members and permission levels for {activeOrganization?.name}.
              </p>
            </div>

            <a
              href="/organizations/invite"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite New Member</span>
            </a>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border font-mono text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">
                      {m.user?.firstName} {m.user?.lastName}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">{m.user?.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          m.role === Role.ADMIN
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : m.role === Role.REVIEWER
                              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                              : m.role === Role.SUPPORT_AGENT
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                : 'bg-secondary text-muted-foreground border-border'
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: API Keys */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="panel-card p-6 max-w-3xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Generate New Integration API Key
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                API keys grant secure programmatic access to tickets, pull requests, and audit logs.
              </p>
            </div>

            <form onSubmit={handleCreateApiKey} className="flex gap-2">
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Name (e.g. GitHub Webhook Worker)..."
                className="flex-1 rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create API Key</span>
              </button>
            </form>
          </div>

          <div className="panel-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Active Workspace API Keys</h3>
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{key.name}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {key.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Prefix: {key.prefix} • Created: {key.created}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyKey(key.id)}
                      className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-mono font-semibold flex items-center gap-1"
                    >
                      {copiedId === key.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Governance */}
      {activeTab === 'security' && (
        <div className="panel-card module-accent-security p-6 max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Security & Governance Policies</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enforce organization-wide security rules and compliance configurations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  Mandatory Two-Factor Authentication (2FA)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Require all organization members to verify 2FA prior to accessing sensitive
                  resources.
                </p>
              </div>
              <button
                onClick={() => setEnforce2FA(!enforce2FA)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  enforce2FA ? 'bg-emerald-600' : 'bg-secondary'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    enforce2FA ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
                  Session Timeout Duration
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="1h">1 Hour</option>
                  <option value="8h">8 Hours</option>
                  <option value="24h">24 Hours (Default)</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-muted-foreground uppercase">
                  Audit Log Retention Period
                </label>
                <select
                  value={auditRetention}
                  onChange={(e) => setAuditRetention(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="90d">90 Days</option>
                  <option value="180d">180 Days</option>
                  <option value="365d">365 Days (SOC2 Standard)</option>
                  <option value="indefinite">Indefinite Retention</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
