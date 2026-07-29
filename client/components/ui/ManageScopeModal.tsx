'use client';

import React, { useState } from 'react';
import { Building2, X, Users, Sliders, ToggleLeft, ToggleRight, Zap, CheckCircle2 } from 'lucide-react';

interface ManageScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  onSaveSuccess?: () => void;
}

export function ManageScopeModal({ isOpen, onClose, organization, onSaveSuccess }: ManageScopeModalProps) {
  const [maxMembers, setMaxMembers] = useState(50);
  const [features, setFeatures] = useState({
    AI_DIGEST: true,
    CROSS_ORG_SHARING: true,
    REVIEW_CONSOLE: true,
    NOTIFICATIONS: true,
    ADVANCED_ANALYTICS: true,
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !organization) return null;

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-text-primary">Manage Tenant Scope</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-secondary border border-border text-text-primary">
                  {organization.slug}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Configure features, user quotas, and security boundaries for {organization.name}
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

        {/* Tenant Configuration Sections */}
        <div className="space-y-5">
          {/* Member Quota Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-text-primary flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" /> Member Capacity Quota
              </label>
              <span className="font-mono text-primary font-bold text-xs">{maxMembers} Seats</span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              step={10}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-secondary">
              <span>10 seats</span>
              <span>125 seats</span>
              <span>250 seats</span>
            </div>
          </div>

          {/* Feature Flags Scope Matrix */}
          <div className="space-y-2">
            <label className="font-semibold text-xs text-text-primary flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" /> Tenant Feature Matrix
            </label>
            <div className="space-y-2 p-3 rounded-md border border-border bg-surface-secondary/50">
              {Object.entries(features).map(([key, enabled]) => (
                <div
                  key={key}
                  onClick={() => toggleFeature(key as keyof typeof features)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-surface transition-colors cursor-pointer select-none border border-border/40 bg-surface"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-text-primary">{key}</span>
                    <p className="text-[10px] text-text-secondary">
                      {key === 'AI_DIGEST' && 'Automated LLM executive summary worker'}
                      {key === 'CROSS_ORG_SHARING' && 'Cross-tenant resource sharing & guest access'}
                      {key === 'REVIEW_CONSOLE' && 'Peer code review and approval console'}
                      {key === 'NOTIFICATIONS' && 'Real-time WebSocket & email notification engine'}
                      {key === 'ADVANCED_ANALYTICS' && 'Executive analytics & SLA audit reporting'}
                    </p>
                  </div>
                  {enabled ? (
                    <ToggleRight className="w-6 h-6 text-success transition-colors" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-text-secondary transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scope Status */}
          <div className="p-3 rounded-md border border-border bg-surface-secondary text-xs text-text-primary flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <span>Scope changes apply instantly to all connected tenant sessions without service interruption.</span>
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
              'Save Scope Configuration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
