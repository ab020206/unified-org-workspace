'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, ChevronDown, Plus, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function OrgSwitcher() {
  const { user, activeOrganization, userOrganizations, switchOrganization } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isSuperAdmin = Boolean(user?.isPlatformUser);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-secondary hover:bg-surface border border-border text-xs font-medium text-text-primary transition-colors cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
      >
        <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary">
          {isSuperAdmin && !activeOrganization ? (
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-primary" />
          )}
        </div>
        <span className="max-w-[140px] truncate font-semibold text-text-primary">
          {activeOrganization?.name || (isSuperAdmin ? 'Platform Governance' : 'Select Workspace')}
        </span>
        {activeOrganization?.userRole ? (
          <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-1.5 py-0.5 rounded bg-surface border border-border text-text-primary">
            {activeOrganization.userRole}
          </span>
        ) : isSuperAdmin ? (
          <span className="text-[10px] uppercase font-mono font-medium px-1.5 py-0.5 rounded bg-surface border border-border text-text-primary">
            Super Admin
          </span>
        ) : null}
        <ChevronDown className="w-3.5 h-3.5 text-text-secondary ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 rounded-lg border border-border bg-surface shadow-md z-50 p-2 space-y-1">
            <p className="px-2 py-1 text-[11px] font-mono font-medium text-text-secondary uppercase tracking-wider">
              Organizations
            </p>
            {userOrganizations.map((org) => {
              const isSelected = org.id === activeOrganization?.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={async () => {
                    await switchOrganization(org.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[180px] truncate">
                    <Building2 className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="truncate">{org.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}

            <div className="pt-1.5 border-t border-border">
              <Link
                href="/organizations/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Organization</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
