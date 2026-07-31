'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@workspace/shared-types';
import {
  Sparkles,
  Search,
  Ticket,
  GitPullRequest,
  Shield,
  Users,
  Settings,
  Building2,
  Network,
  CornerDownLeft,
  X,
  Clock,
  CheckCircle2,
  GitMerge,
  Share2,
  FileSpreadsheet,
  ToggleLeft,
  Activity,
  PlusCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  title: string;
  category: 'ai' | 'nav' | 'actions';
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  badge?: string;
}

export function GlobalCommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { user, activeOrganization } = useAuth();
  const role = user?.isPlatformUser
    ? Role.SUPER_ADMIN
    : (activeOrganization?.userRole as Role) || Role.GUEST;

  // Role-gated command items strictly restricted to allowed features per role
  const getCommandItems = (): CommandItem[] => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return [
          {
            id: 'ai-workspace',
            title: 'Open AI Workspace & Assistant',
            category: 'ai',
            icon: Sparkles,
            href: '/digest',
            badge: 'Primary AI',
          },
          {
            id: 'ai-brief',
            title: 'Generate Executive Briefing',
            category: 'ai',
            icon: Sparkles,
            href: '/digest',
            badge: 'AI Report',
          },
          {
            id: 'knowledge-graph',
            title: 'View Organization Knowledge Graph',
            category: 'ai',
            icon: Network,
            href: '/knowledge-graph',
            badge: 'Graph',
          },
          {
            id: 'nav-orgs',
            title: 'Organizations Directory',
            category: 'nav',
            icon: Building2,
            href: '/organizations',
          },
          {
            id: 'nav-users',
            title: 'Platform Users Governance',
            category: 'nav',
            icon: Users,
            href: '/users',
          },
          {
            id: 'nav-audit',
            title: 'Global Audit Console',
            category: 'nav',
            icon: Shield,
            href: '/audit',
          },
          {
            id: 'nav-flags',
            title: 'Feature Flags Control Matrix',
            category: 'nav',
            icon: ToggleLeft,
            href: '/feature-flags',
          },
          {
            id: 'nav-health',
            title: 'System Infrastructure Telemetry',
            category: 'nav',
            icon: Activity,
            href: '/health',
          },
          {
            id: 'nav-analytics',
            title: 'Global Platform Analytics',
            category: 'nav',
            icon: Sparkles,
            href: '/analytics',
          },
          {
            id: 'nav-security',
            title: 'Security Console — Policy & Keys',
            category: 'nav',
            icon: Shield,
            href: '/security',
          },
          {
            id: 'nav-settings',
            title: 'Workspace Settings & Governance',
            category: 'nav',
            icon: Settings,
            href: '/settings',
          },
          {
            id: 'act-create-org',
            title: 'Provision New Tenant Organization',
            category: 'actions',
            icon: PlusCircle,
            href: '/organizations/create',
          },
        ];

      case Role.ADMIN:
        return [
          {
            id: 'ai-workspace',
            title: 'Open AI Workspace & Assistant',
            category: 'ai',
            icon: Sparkles,
            href: '/ai-workspace',
            badge: 'Primary AI',
          },
          {
            id: 'ai-brief',
            title: 'Generate Executive Briefing',
            category: 'ai',
            icon: Sparkles,
            href: '/digest',
            badge: 'AI Report',
          },
          {
            id: 'knowledge-graph',
            title: 'View Organization Knowledge Graph',
            category: 'ai',
            icon: Network,
            href: '/knowledge-graph',
            badge: 'Graph',
          },
          {
            id: 'nav-members',
            title: 'Workspace Members & Governance',
            category: 'nav',
            icon: Users,
            href: '/members',
          },
          {
            id: 'nav-tickets',
            title: 'Support Hub — Tickets',
            category: 'nav',
            icon: Ticket,
            href: '/tickets',
          },
          {
            id: 'nav-prs',
            title: 'Review Console — Pull Requests',
            category: 'nav',
            icon: GitPullRequest,
            href: '/pull-requests',
          },
          {
            id: 'nav-reports',
            title: 'Workspace Executive Reports',
            category: 'nav',
            icon: Sparkles,
            href: '/reports',
          },
          {
            id: 'nav-settings',
            title: 'Workspace Settings & Governance',
            category: 'nav',
            icon: Settings,
            href: '/settings',
          },
          {
            id: 'act-invite',
            title: 'Add / Invite Organization Member',
            category: 'actions',
            icon: Users,
            href: '/members',
          },
          {
            id: 'act-new-ticket',
            title: 'Create New Support Ticket',
            category: 'actions',
            icon: Ticket,
            href: '/tickets/new',
          },
          {
            id: 'act-new-pr',
            title: 'Submit New Pull Request',
            category: 'actions',
            icon: GitPullRequest,
            href: '/pull-requests/new',
          },
        ];

      case Role.SUPPORT_AGENT:
        return [
          {
            id: 'nav-my-tickets',
            title: 'My Assigned Support Tickets',
            category: 'nav',
            icon: Clock,
            href: '/tickets?queue=mine',
          },
          {
            id: 'nav-search-tickets',
            title: 'Search All Support Tickets',
            category: 'nav',
            icon: Search,
            href: '/tickets?search=true',
          },
          {
            id: 'act-new-ticket',
            title: 'Create New Support Ticket',
            category: 'actions',
            icon: Ticket,
            href: '/tickets/new',
          },
          {
            id: 'nav-notifications',
            title: 'View System Notifications',
            category: 'nav',
            icon: Ticket,
            href: '/notifications',
          },
        ];

      case Role.REVIEWER:
        return [
          {
            id: 'nav-prs',
            title: 'Code Review Console — Pull Requests',
            category: 'nav',
            icon: GitPullRequest,
            href: '/pull-requests',
          },
          {
            id: 'nav-approved',
            title: 'Approved Pull Requests',
            category: 'nav',
            icon: CheckCircle2,
            href: '/pull-requests?status=APPROVED',
          },
          {
            id: 'nav-history',
            title: 'Merged Pull Request History',
            category: 'nav',
            icon: GitMerge,
            href: '/pull-requests?status=history',
          },
          {
            id: 'act-new-pr',
            title: 'Submit New Pull Request',
            category: 'actions',
            icon: GitPullRequest,
            href: '/pull-requests/new',
          },
        ];

      case Role.GUEST:
        return [
          {
            id: 'nav-collab',
            title: 'Cross-Tenant Shared Resources',
            category: 'nav',
            icon: Share2,
            href: '/collaboration',
          },
        ];

      case Role.AUDITOR:
        return [
          {
            id: 'nav-audit-logs',
            title: 'Audit Console — Activity Logs',
            category: 'nav',
            icon: Shield,
            href: '/audit',
          },
          {
            id: 'nav-compliance-reports',
            title: 'Compliance Reports',
            category: 'nav',
            icon: FileSpreadsheet,
            href: '/audit?tab=reports',
          },
        ];

      default:
        return [
          {
            id: 'nav-dashboard',
            title: 'Workspace Dashboard',
            category: 'nav',
            icon: Clock,
            href: '/dashboard',
          },
        ];
    }
  };

  const commandItems = getCommandItems();

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onClose();
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [onClose, router]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-[10px] border border-border bg-surface text-text-primary shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-muted-text focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-border/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-primary mx-auto" />
              <p className="text-xs font-semibold text-text-primary">No matching commands</p>
              <p className="text-[13px] text-text-secondary">
                No command available for role <span className="font-mono text-primary">{role}</span>
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const IconComponent = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3 py-2.5 rounded-md text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                      : 'text-text-primary hover:bg-surface-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface-secondary text-text-secondary border border-border'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-secondary text-text-primary border border-border">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 border-t border-border bg-surface-secondary text-[11px] text-text-secondary font-mono flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-text-primary">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-text-primary">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-text-primary">
              ESC
            </kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
