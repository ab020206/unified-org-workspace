'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  ShieldCheck,
  Search,
  Loader2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface OrgSwitcherProps {
  className?: string;
}

export function OrgSwitcher({ className = 'w-full' }: OrgSwitcherProps) {
  const {
    user,
    activeOrganization,
    userOrganizations,
    recentlyUsedOrgs,
    switchOrganization,
    isSwitchingOrg,
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const isSuperAdmin = Boolean(user?.isPlatformUser);

  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) return userOrganizations;
    const query = searchQuery.toLowerCase();
    return userOrganizations.filter(
      (org) => org.name.toLowerCase().includes(query) || org.slug.toLowerCase().includes(query)
    );
  }, [userOrganizations, searchQuery]);

  const recentOrgsList = useMemo(() => {
    return userOrganizations.filter((org) => recentlyUsedOrgs.includes(org.id));
  }, [userOrganizations, recentlyUsedOrgs]);

  const handleSwitch = async (targetOrgId: string) => {
    try {
      setErrorToast(null);
      await switchOrganization(targetOrgId);
      setIsOpen(false);
      setSuccessToast(
        targetOrgId === 'platform'
          ? 'Switched to Platform View'
          : `Switched to active workspace`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to switch organization';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const currentRole = isSuperAdmin && !activeOrganization ? 'SUPER_ADMIN' : activeOrganization?.userRole;

  return (
    <div className={`relative inline-block text-left select-none z-30 ${className}`}>
      {/* Toast Alert Feedback */}
      {(successToast || errorToast) && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium bg-surface border border-border text-text-primary animate-in fade-in slide-in-from-bottom-2">
          {successToast ? (
            <Sparkles className="w-4 h-4 text-success shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
          )}
          <span>{successToast || errorToast}</span>
        </div>
      )}

      {/* Switcher Trigger Button */}
      <button
        type="button"
        disabled={isSwitchingOrg}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-surface hover:bg-surface-secondary border border-border text-xs font-medium text-text-primary transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 overflow-hidden"
        aria-label="Switch organization"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary shrink-0 font-semibold font-mono text-[11px] overflow-hidden">
            {isSwitchingOrg ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            ) : isSuperAdmin && !activeOrganization ? (
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            ) : activeOrganization?.logo ? (
              <img src={activeOrganization.logo} alt={activeOrganization.name} className="w-full h-full object-cover" />
            ) : (
              <span>{activeOrganization?.name ? activeOrganization.name.charAt(0).toUpperCase() : 'P'}</span>
            )}
          </div>

          <div className="flex flex-col text-left min-w-0 flex-1 truncate leading-tight">
            <span className="font-semibold text-text-primary truncate">
              {activeOrganization?.name || (isSuperAdmin ? 'Platform Governance' : 'Select Workspace')}
            </span>
            <span className="text-[10px] text-text-secondary font-mono truncate">
              {activeOrganization ? `@${activeOrganization.slug}` : isSuperAdmin ? 'Super Admin Scope' : 'No org selected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {currentRole && (
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface-secondary border border-border text-text-primary">
              {currentRole}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Switcher Dropdown / Responsive Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-xl z-50 p-3 space-y-3 max-h-[85vh] overflow-y-auto"
            >
              {/* Header & Search Filter Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
                    Organizations
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search organizations..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface-secondary border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-text-secondary hover:text-text-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Platform View Item (Platform Super Admin Only) */}
              {isSuperAdmin && (
                <div className="border-b border-border/80 pb-2">
                  <button
                    type="button"
                    disabled={isSwitchingOrg}
                    onClick={() => handleSwitch('platform')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      !activeOrganization
                        ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                        : 'text-text-primary hover:bg-surface-secondary border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col text-left truncate">
                        <span className="font-semibold truncate">Platform Governance</span>
                        <span className="text-[10px] text-text-secondary font-mono">Global Super Admin View</span>
                      </div>
                    </div>
                    {!activeOrganization && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                </div>
              )}

              {/* Recently Used Organizations Section */}
              {recentOrgsList.length > 0 && !searchQuery && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 px-1 text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    <span>Recently Used</span>
                  </div>
                  <div className="space-y-1">
                    {recentOrgsList.map((org) => (
                      <button
                        key={`recent-${org.id}`}
                        type="button"
                        disabled={isSwitchingOrg}
                        onClick={() => handleSwitch(org.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-surface-secondary transition-colors text-text-primary"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                          <span className="truncate">{org.name}</span>
                        </div>
                        <span className="text-[9px] font-mono text-text-secondary uppercase font-semibold">
                          {(org as any).userRole || (org as any).role || 'MEMBER'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Organizations Section */}
              <div className="space-y-1">
                <p className="px-1 text-[10px] font-mono font-medium text-text-secondary uppercase tracking-wider">
                  All Organizations ({filteredOrganizations.length})
                </p>

                {filteredOrganizations.length === 0 ? (
                  <div className="py-4 text-center text-xs text-text-secondary font-mono">
                    No organizations found
                  </div>
                ) : (
                  filteredOrganizations.map((org) => {
                    const isSelected = org.id === activeOrganization?.id;
                    const orgRole = (org as any).userRole || (org as any).role;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        disabled={isSwitchingOrg}
                        onClick={() => handleSwitch(org.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                            : 'text-text-primary hover:bg-surface-secondary border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 max-w-[200px] truncate">
                          <div className="w-6 h-6 rounded bg-surface-secondary border border-border flex items-center justify-center font-mono font-bold text-[10px] text-text-primary shrink-0 overflow-hidden">
                            {org.logo ? (
                              <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{org.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex flex-col text-left truncate leading-tight">
                            <span className="truncate">{org.name}</span>
                            <span className="text-[10px] text-text-secondary font-mono truncate">@{org.slug}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {orgRole && (
                            <span className="text-[9px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded bg-surface-secondary border border-border text-text-secondary">
                              {orgRole}
                            </span>
                          )}
                          {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Create Organization Footer Button (Platform Super Admin Only) */}
              {isSuperAdmin && (
                <div className="pt-2 border-t border-border">
                  <Link
                    href="/organizations/create"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Organization</span>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
