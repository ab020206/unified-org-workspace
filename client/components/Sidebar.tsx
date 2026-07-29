'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  ToggleLeft,
  Activity,
  Settings,
  Sparkles,
  Ticket,
  GitPullRequest,
  Search,
  Bell,
  GitMerge,
  CheckCircle2,
  Clock,
  Share2,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@workspace/shared-types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, activeOrganization } = useAuth();
  const role = user?.isPlatformUser
    ? Role.SUPER_ADMIN
    : (activeOrganization?.userRole as Role) || Role.GUEST;

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Organizations', href: '/organizations', icon: Building2 },
          { name: 'Platform Users', href: '/users', icon: Users },
          { name: 'Global Audit', href: '/audit', icon: Shield },
          { name: 'Feature Flags', href: '/feature-flags', icon: ToggleLeft },
          { name: 'Health', href: '/health', icon: Activity },
          { name: 'Analytics', href: '/analytics', icon: Sparkles },
          { name: 'Settings', href: '/settings', icon: Settings },
        ];

      case Role.ADMIN:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Members', href: '/members', icon: Users },
          { name: 'Support', href: '/tickets', icon: Ticket },
          { name: 'Reviews', href: '/pull-requests', icon: GitPullRequest },
          { name: 'Reports', href: '/reports', icon: Sparkles },
          { name: 'Settings', href: '/settings', icon: Settings },
        ];

      case Role.SUPPORT_AGENT:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'My Tickets', href: '/tickets?queue=mine', icon: Clock },
          { name: 'Search', href: '/tickets?search=true', icon: Search },
          { name: 'Notifications', href: '/notifications', icon: Bell },
        ];

      case Role.REVIEWER:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Reviews', href: '/pull-requests', icon: GitPullRequest },
          { name: 'Approvals', href: '/pull-requests?status=APPROVED', icon: CheckCircle2 },
          { name: 'History', href: '/pull-requests?status=history', icon: GitMerge },
        ];

      case Role.GUEST:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Shared Resources', href: '/collaboration', icon: Share2 },
        ];

      case Role.AUDITOR:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Audit Logs', href: '/audit', icon: Shield },
          { name: 'Reports', href: '/audit?tab=reports', icon: FileSpreadsheet },
        ];

      default:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Notifications', href: '/notifications', icon: Bell },
        ];
    }
  };

  const visibleNavItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface text-text-primary flex flex-col justify-between h-screen sticky top-0 z-40 select-none shadow-xs">
      <div>
        {/* Brand Logo */}
        <div className="h-16 border-b border-border flex items-center px-5 gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden shadow-xs shrink-0">
            <img src="/logo.png" alt="Froncort.ai" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-text-primary">Froncort.ai</h1>
            <p className="text-[11px] text-text-secondary font-mono tracking-tight">
              Unified Workspace
            </p>
          </div>
        </div>

        {/* Dynamic Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider border-b border-border/60 mb-2 pb-2">
            <span>Navigation</span>
            <span className="text-text-primary px-2 py-0.5 rounded bg-surface-secondary border border-border">
              {role}
            </span>
          </div>

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const basePath = item.href.split('?')[0];
            const isActive =
              pathname === item.href ||
              (basePath !== '/dashboard' && pathname.startsWith(basePath));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors group',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors z-10',
                    isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  )}
                />
                <span className="z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Footer Info */}
      <div className="p-3 border-t border-border bg-surface-secondary/50">
        <div className="rounded-lg p-3 bg-surface border border-border text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
              Current Scope
            </span>
            <span className="w-2 h-2 rounded-full bg-success" />
          </div>
          <p className="font-semibold text-text-primary text-xs truncate">
            {role === Role.SUPER_ADMIN
              ? 'Global Platform Scope'
              : role === Role.AUDITOR
                ? 'Global Compliance Scope'
                : activeOrganization?.name || 'Active Workspace'}
          </p>
        </div>
      </div>
    </aside>
  );
}
