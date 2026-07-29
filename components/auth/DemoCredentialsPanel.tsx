'use client';

import React, { useState } from 'react';
import { DEMO_USERS, DEMO_PASSWORD, DemoUserConfig } from '@/src/config/demoUsers';
import {
  ShieldCheck,
  Building2,
  Headphones,
  GitPullRequest,
  Eye,
  Zap,
  Copy,
  Check,
  UserCheck,
  KeyRound,
  LogIn,
} from 'lucide-react';

interface Props {
  onSelectCredential: (email: string, password: string) => void;
}

export function DemoCredentialsPanel({ onSelectCredential }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Building2':
        return Building2;
      case 'Headphones':
        return Headphones;
      case 'GitPullRequest':
        return GitPullRequest;
      case 'Eye':
        return Eye;
      default:
        return UserCheck;
    }
  };

  const handleCopy = (e: React.MouseEvent, text: string, fieldId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredUsers = DEMO_USERS.filter((u) => {
    if (filterRole === 'ADMIN') return u.roleBadge === 'SUPER_ADMIN' || u.roleBadge === 'ADMIN';
    if (filterRole === 'DEV') return u.roleBadge === 'DEVELOPER' || u.roleBadge === 'MANAGER';
    if (filterRole === 'AUDIT') return u.roleBadge === 'SECURITY' || u.roleBadge === 'AUDITOR';
    if (filterRole === 'OTHER') return u.roleBadge === 'SUPPORT' || u.roleBadge === 'VIEWER';
    return true;
  });

  return (
    <div className="w-full rounded-xl border border-border bg-surface shadow-sm overflow-hidden p-4 space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Demo Credentials</h3>
            <p className="text-xs text-text-secondary">Click any role to autofill login details</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-secondary p-1 rounded-lg border border-border text-[10px] font-mono">
          {['ALL', 'ADMIN', 'DEV', 'AUDIT', 'OTHER'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterRole(cat)}
              className={`px-2 py-0.5 rounded transition-colors font-medium cursor-pointer ${
                filterRole === cat
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Password Notice */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-secondary border border-border text-xs">
        <div className="flex items-center gap-2 text-text-secondary font-mono">
          <KeyRound className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Shared Password:</span>
          <strong className="text-text-primary font-bold">{DEMO_PASSWORD}</strong>
        </div>
        <button
          type="button"
          onClick={(e) => handleCopy(e, DEMO_PASSWORD, 'shared-pass')}
          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono cursor-pointer"
        >
          {copiedField === 'shared-pass' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          <span>{copiedField === 'shared-pass' ? 'Copied!' : 'Copy Pass'}</span>
        </button>
      </div>

      {/* Demo Users List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredUsers.map((user: DemoUserConfig) => {
          const IconComponent = getRoleIcon(user.iconName);
          const emailCopied = copiedField === `email-${user.id}`;

          return (
            <div
              key={user.id}
              onClick={() => onSelectCredential(user.email, user.password || DEMO_PASSWORD)}
              className="group p-3 rounded-lg border border-border bg-surface hover:bg-surface-secondary/80 hover:border-primary/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-surface-secondary border border-border text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary truncate">{user.roleTitle}</span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-secondary text-[10px] font-mono font-medium text-text-secondary border border-border">
                      {user.organizationName}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary truncate">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  title="Copy Email"
                  onClick={(e) => handleCopy(e, user.email, `email-${user.id}`)}
                  className="p-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors text-xs inline-flex items-center gap-1 font-mono cursor-pointer"
                >
                  {emailCopied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden md:inline">{emailCopied ? 'Copied' : 'Email'}</span>
                </button>

                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded bg-primary text-primary-foreground font-medium text-xs inline-flex items-center gap-1.5 shadow-xs group-hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Login as</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
