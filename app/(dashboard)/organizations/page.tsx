'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import { Building2, Search, PlusCircle, Edit, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { ManageScopeModal } from '@/components/ui/ManageScopeModal';
import { EditOrganizationModal } from '@/components/ui/EditOrganizationModal';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrgForScope, setSelectedOrgForScope] = useState<any | null>(null);
  const [selectedOrgForEdit, setSelectedOrgForEdit] = useState<any | null>(null);

  const fetchOrgs = () => {
    fetch(`${API_BASE_URL}/organizations`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOrganizations(data.data);
        }
      })
      .catch((err) => console.error('Error fetching organizations:', err));
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Tenant Organizations Management"
        moduleAccent="support"
        breadcrumbs={['Platform Admin', 'Organizations Directory']}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      {/* Header Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
          </div>
          <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
            Multi-Tenant Organizations
          </h2>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Manage platform tenants, inspect organization memberships, provision workspace scope,
            and monitor tenant health.
          </p>
        </div>
        <Link
          href="/organizations/create"
          className="px-4 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs transition-all shadow-xs flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Provision New Tenant
        </Link>
      </div>

      {/* Search Bar & Table */}
      <div className="p-5 rounded-[10px] border border-border bg-surface space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <h3 className="font-semibold text-sm text-text-primary">
            Registered Organizations ({filteredOrgs.length})
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-secondary font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Organization Name</th>
                <th className="py-2.5 px-3">Slug</th>
                <th className="py-2.5 px-3">Members</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-surface-secondary/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs font-mono">
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-text-primary text-xs">{org.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-text-secondary">{org.slug}</td>
                  <td className="py-3 px-3 font-mono text-text-primary">
                    {org.memberCount || 1} Active Members
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success font-mono text-[10px] font-bold">
                      HEALTHY
                    </span>
                  </td>
                  <td className="py-3 px-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrgForEdit(org)}
                      className="px-2.5 py-1 rounded-md bg-surface-secondary hover:bg-surface border border-border text-text-primary font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3 h-3 text-text-secondary" /> Edit Org
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrgForScope(org)}
                      className="px-2.5 py-1 rounded-md bg-surface-secondary hover:bg-surface border border-border text-primary font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Manage Scope <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Manage Scope Modal */}
      <ManageScopeModal
        isOpen={Boolean(selectedOrgForScope)}
        onClose={() => setSelectedOrgForScope(null)}
        organization={selectedOrgForScope}
      />

      {/* Edit Organization Modal */}
      <EditOrganizationModal
        isOpen={Boolean(selectedOrgForEdit)}
        onClose={() => setSelectedOrgForEdit(null)}
        organization={selectedOrgForEdit}
        onSuccess={() => fetchOrgs()}
      />
    </div>
  );
}
