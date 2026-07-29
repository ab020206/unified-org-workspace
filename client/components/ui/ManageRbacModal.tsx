'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, UserCheck, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ManageRbacModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  onSaveSuccess?: () => void;
}

export function ManageRbacModal({ isOpen, onClose, user, onSaveSuccess }: ManageRbacModalProps) {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'SUPPORT_AGENT');
  const [permissionOverrides, setPermissionOverrides] = useState({
    canDeleteTickets: false,
    canApproveReviews: true,
    canManageMembers: false,
    canExportAuditLogs: true,
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !user) return null;

  const togglePermission = (key: keyof typeof permissionOverrides) => {
    setPermissionOverrides((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[10px] border border-border bg-surface p-6 shadow-lg space-y-6 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-text-primary">Manage RBAC Controls</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-secondary border border-border text-text-primary">
                  {selectedRole}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Configure role access level and granular permission overrides for <strong className="text-text-primary">{user.name}</strong> ({user.email})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-5">
          {/* Role Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-xs text-text-primary flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary" /> Assign Enterprise Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface border border-border text-xs font-semibold text-text-primary focus:outline-none focus:border-primary font-mono cursor-pointer"
            >
              <option value="SUPER_ADMIN">Platform Super Admin (SUPER_ADMIN)</option>
              <option value="ADMIN">Organization Admin (ADMIN)</option>
              <option value="SUPPORT_AGENT">Support Agent (SUPPORT_AGENT)</option>
              <option value="REVIEWER">Reviewer (REVIEWER)</option>
              <option value="GUEST">Guest Collaborator (GUEST)</option>
              <option value="AUDITOR">Read-Only Auditor (AUDITOR)</option>
            </select>
          </div>

          {/* Granular Permission Toggles */}
          <div className="space-y-2">
            <label className="font-semibold text-xs text-text-primary flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-primary" /> Granular Permission Matrix
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-md border border-border bg-surface-secondary/50 font-mono text-xs">
              {Object.entries(permissionOverrides).map(([key, enabled]) => (
                <label
                  key={key}
                  onClick={() => togglePermission(key as keyof typeof permissionOverrides)}
                  className="flex items-center justify-between p-2 rounded-md bg-surface border border-border hover:bg-surface-secondary cursor-pointer select-none"
                >
                  <span className="text-[11px] font-semibold text-text-primary">{key}</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => {}}
                    className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3 rounded-md border border-warning/20 bg-warning/10 text-xs text-warning flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <span>Role changes will update session tokens immediately on next API request.</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-border bg-surface-secondary hover:bg-surface text-xs font-medium text-text-primary transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-xs font-semibold text-primary-foreground shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" /> Saved!
              </>
            ) : (
              'Save Permissions'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
