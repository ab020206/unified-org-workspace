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
    if (filterRole === 'MULTI-ORG')
      return u.roleBadge === 'MULTI_MEMBERSHIP' || u.roleBadge === 'SUPER_ADMIN';
    if (filterRole === 'ADMIN')
      return (
        u.roleBadge === 'SUPER_ADMIN' ||
        u.roleBadge === 'ADMIN' ||
        u.role === 'ADMIN' ||
        u.role === 'SUPER_ADMIN'
      );
    if (filterRole === 'SUPPORT')
      return u.roleBadge === 'SUPPORT' || u.role === 'SUPPORT_AGENT';
    if (filterRole === 'REVIEWER')
      return u.roleBadge === 'REVIEWER' || u.role === 'REVIEWER';
    if (filterRole === 'AUDIT/GUEST')
      return (
        u.roleBadge === 'AUDITOR' ||
        u.roleBadge === 'GUEST' ||
        u.role === 'AUDITOR' ||
        u.role === 'GUEST'
      );
    return true;
  });

  const filterTabs = [
    { label: 'All Accounts', value: 'ALL' },
    { label: 'Multi-Org', value: 'MULTI-ORG' },
    { label: 'Admins', value: 'ADMIN' },
    { label: 'Support', value: 'SUPPORT' },
    { label: 'Reviewers', value: 'REVIEWER' },
    { label: 'Audit & Guests', value: 'AUDIT/GUEST' },
  ];

  return (
    <div className="w-full h-full min-h-[440px] max-h-[50vh] rounded-xl border border-border bg-surface shadow-sm p-4 flex flex-col justify-between space-y-3 overflow-hidden">
      <div className="space-y-3">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                Demo Credentials
              </h3>
              <p className="text-[11px] text-text-secondary">
                Click any role below to autofill login inputs
              </p>
            </div>
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] font-mono scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterRole(tab.value)}
              className={`px-2 py-0.5 rounded transition-all font-medium whitespace-nowrap cursor-pointer ${
                filterRole === tab.value
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Shared Password Notice */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-secondary/70 border border-border text-[11px]">
          <div className="flex items-center gap-1.5 text-text-secondary font-mono">
            <KeyRound className="w-3 h-3 text-primary shrink-0" />
            <span>Shared Password:</span>
            <strong className="text-text-primary font-bold">{DEMO_PASSWORD}</strong>
          </div>
          <button
            type="button"
            onClick={(e) => handleCopy(e, DEMO_PASSWORD, 'shared-pass')}
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-mono cursor-pointer"
          >
            {copiedField === 'shared-pass' ? (
              <Check className="w-3 h-3 text-success" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copiedField === 'shared-pass' ? 'Copied!' : 'Copy Pass'}</span>
          </button>
        </div>
      </div>

      {/* Demo Users List */}
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
        {filteredUsers.map((user: DemoUserConfig) => {
          const IconComponent = getRoleIcon(user.iconName);
          const emailCopied = copiedField === `email-${user.id}`;

          return (
            <div
              key={user.id}
              onClick={() => onSelectCredential(user.email, user.password || DEMO_PASSWORD)}
              className="group p-3 rounded-lg border border-border bg-surface hover:bg-surface-secondary/80 hover:border-primary/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              {/* Employee & Role Information */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-surface-secondary border border-border text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-text-primary">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {user.roleTitle}
                    </span>
                    <span className="text-[10px] font-mono text-text-secondary bg-surface-secondary px-2 py-0.5 rounded border border-border">
                      {user.organizationName}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  title="Copy Email"
                  onClick={(e) => handleCopy(e, user.email, `email-${user.id}`)}
                  className="p-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors text-xs inline-flex items-center gap-1 font-mono cursor-pointer"
                >
                  {emailCopied ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="hidden md:inline">{emailCopied ? 'Copied' : 'Email'}</span>
                </button>

                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded bg-primary text-primary-foreground font-medium text-xs inline-flex items-center gap-1.5 shadow-xs group-hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Autofill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
