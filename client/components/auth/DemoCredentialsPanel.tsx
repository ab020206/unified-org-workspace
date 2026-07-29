'use client';

import React, { useState } from 'react';
import { DEMO_USERS, DemoUserConfig } from '../../../packages/shared-config/demoUsers';
import {
  ShieldCheck,
  Building2,
  Headphones,
  GitPullRequest,
  Eye,
  Sparkles,
  Zap,
  ArrowRight,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react';

interface Props {
  onSelectCredential: (user: DemoUserConfig) => void;
}

export function DemoCredentialsPanel({ onSelectCredential }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ADMIN' | 'WORKER' | 'GUEST'>('ALL');

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
      case 'Sparkles':
        return Sparkles;
      case 'UserCheck':
      default:
        return UserCheck;
    }
  };

  const handleCopyEmail = (e: React.MouseEvent, email: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = DEMO_USERS.filter((u: DemoUserConfig) => {
    if (activeTab === 'ADMIN') return u.roleBadge === 'SUPER_ADMIN' || u.roleBadge === 'ADMIN';
    if (activeTab === 'WORKER')
      return u.roleBadge === 'SUPPORT_AGENT' || u.roleBadge === 'REVIEWER';
    if (activeTab === 'GUEST') return u.roleBadge === 'GUEST' || u.roleBadge === 'AUDITOR';
    return true;
  });

  return (
    <div className="w-full space-y-3">
      {/* Compact Header Bar & Role Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-warning/10 border border-warning/20 text-warning font-mono text-[10px] font-bold uppercase">
            <Zap className="w-3 h-3 text-warning" />
            <span>Quick Demo Access</span>
          </div>
          <span className="text-xs text-text-secondary font-medium hidden md:inline">
            Select a role for instant one-click login
          </span>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1 bg-surface-secondary p-1 rounded-md border border-border text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-2 py-0.5 rounded transition-all font-semibold cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All (8)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ADMIN')}
            className={`px-2 py-0.5 rounded transition-all font-semibold cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Admins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WORKER')}
            className={`px-2 py-0.5 rounded transition-all font-semibold cursor-pointer ${
              activeTab === 'WORKER'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Support/PR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GUEST')}
            className={`px-2 py-0.5 rounded transition-all font-semibold cursor-pointer ${
              activeTab === 'GUEST'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Guest/Audit
          </button>
        </div>
      </div>

      {/* Compact Grid Layout (2-column on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredUsers.map((user: DemoUserConfig) => {
          const RoleIcon = getRoleIcon(user.iconName);
          const isCopied = copiedId === user.id;

          return (
            <div
              key={user.id}
              className="p-3 rounded-md border border-border bg-surface hover:bg-surface-secondary/70 transition-all relative flex flex-col justify-between space-y-2 shadow-xs group"
            >
              <div className="space-y-1.5">
                {/* Header Row: Role Icon, Title, Org & Badge */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded border border-border bg-surface-secondary text-primary flex items-center justify-center text-xs font-mono shrink-0">
                      <RoleIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-xs text-text-primary truncate leading-tight group-hover:text-primary transition-colors">
                        {user.roleTitle}
                      </h4>
                      <p className="text-[10px] font-mono text-text-secondary truncate">
                        {user.organizationName}
                      </p>
                    </div>
                  </div>

                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border border-border bg-surface-secondary text-text-primary shrink-0">
                    {user.roleBadge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[10.5px] text-text-secondary leading-tight line-clamp-1">
                  {user.description}
                </p>

                {/* Email text */}
                <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary pt-0.5">
                  <span className="truncate text-text-secondary">{user.email}</span>

                  <button
                    type="button"
                    onClick={(e) => handleCopyEmail(e, user.email, user.id)}
                    className="hover:text-text-primary transition-colors p-0.5 cursor-pointer ml-1"
                    title="Copy Email"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectCredential(user)}
                className="w-full py-1.5 px-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Login as {user.roleTitle}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
