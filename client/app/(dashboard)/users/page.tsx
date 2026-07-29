'use client';

import React, { useEffect, useState } from 'react';
import { CommandBar } from '@/components/ui/CommandBar';
import { Users, Search, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { ManageRbacModal } from '@/components/ui/ManageRbacModal';

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUserForRbac, setSelectedUserForRbac] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/platform/users`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        }
      })
      .catch((err) => console.error('Error fetching platform users:', err));
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <CommandBar
        moduleName="Platform Users Governance Directory"
        moduleAccent="support"
        breadcrumbs={['Platform Admin', 'Users Directory']}
        onAiQuickAction={() => (window.location.href = '/digest')}
      />

      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium">
          <Users className="w-3.5 h-3.5" />
          <span>Platform User Management</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">Platform Users Directory</h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Inspect all platform users across tenant organizations, verify assigned RBAC roles, and manage permission overrides.
        </p>
      </div>

      <div className="p-5 rounded-[10px] border border-border bg-surface space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <h3 className="font-semibold text-sm text-text-primary">Registered Users ({filteredUsers.length})</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary font-mono focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
              <option value="REVIEWER">REVIEWER</option>
              <option value="GUEST">GUEST</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-secondary font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Organization</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-secondary/40 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <h4 className="font-semibold text-text-primary text-xs">{user.name}</h4>
                      <p className="text-[11px] font-mono text-text-secondary">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-surface-secondary border border-border text-text-primary text-[10px] font-bold">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-primary font-medium">{user.org}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForRbac(user)}
                      className="px-2.5 py-1 rounded-md bg-surface-secondary hover:bg-surface border border-border text-primary font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      RBAC Controls <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ManageRbacModal
        isOpen={Boolean(selectedUserForRbac)}
        onClose={() => setSelectedUserForRbac(null)}
        user={selectedUserForRbac}
      />
    </div>
  );
}
