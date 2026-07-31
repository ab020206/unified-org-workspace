'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationBell } from './notifications/NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { OrgSwitcher } from './OrgSwitcher';
import { useAuth } from '@/context/AuthContext';
import { GlobalCommandPalette } from './ui/GlobalCommandPalette';
import { LogOut, Search, Building2, Zap, Lock, Ticket, GitPullRequest, Users } from 'lucide-react';
import { Role } from '@workspace/shared-types';

export function Navbar() {
  const { user, activeOrganization, logout } = useAuth();
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const getScopeBadge = () => {
    if (!user) return null;

    const role = user?.isPlatformUser
      ? Role.SUPER_ADMIN
      : (activeOrganization?.userRole as Role) || Role.GUEST;

    switch (role) {
      case Role.SUPER_ADMIN:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-text-primary font-mono text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>Global Platform Scope</span>
          </div>
        );
      case Role.AUDITOR:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-text-primary font-mono text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Global Compliance Audit</span>
          </div>
        );
      case Role.SUPPORT_AGENT:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-text-primary font-mono text-xs font-medium">
            <Ticket className="w-3.5 h-3.5 text-primary" />
            <span>{activeOrganization?.name || 'Workspace'} (Support Console)</span>
          </div>
        );
      case Role.REVIEWER:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-text-primary font-mono text-xs font-medium">
            <GitPullRequest className="w-3.5 h-3.5 text-primary" />
            <span>{activeOrganization?.name || 'Workspace'} (Review Console)</span>
          </div>
        );
      case Role.GUEST:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-text-primary font-mono text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>{activeOrganization?.name || 'Workspace'} (Guest Scope)</span>
          </div>
        );
      case Role.ADMIN:
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-text-primary font-mono text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>{activeOrganization?.name || 'Active Workspace'}</span>
          </div>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          {user && <OrgSwitcher className="w-auto" />}
          {user ? (
            getScopeBadge()
          ) : (
            <div className="flex items-center gap-2 font-mono font-bold text-sm text-text-primary">
              <img src="/logo.png" alt="Froncort.Ai" className="w-5 h-5 object-contain" />
              Froncort.Ai Workspace
            </div>
          )}

          {/* Quick ⌘K Search trigger button */}
          <button
            type="button"
            onClick={() => setIsCmdPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-secondary text-xs text-text-secondary hover:text-text-primary hover:bg-surface transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search commands...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono font-medium text-text-secondary">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <ThemeToggle />
          <div className="h-4 w-px bg-border my-auto" />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono font-medium text-xs shadow-xs">
                  {user.firstName ? user.firstName[0] : 'U'}
                  {user.lastName ? user.lastName[0] : ''}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold leading-none text-text-primary">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[11px] text-text-secondary leading-tight font-mono">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-md text-text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-secondary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-medium bg-primary hover:bg-primary-hover text-primary-foreground px-3.5 py-1.5 rounded-md transition-colors shadow-xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Global ⌘K Command Palette */}
      <GlobalCommandPalette isOpen={isCmdPaletteOpen} onClose={() => setIsCmdPaletteOpen(false)} />
    </>
  );
}
