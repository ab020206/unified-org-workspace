import React from 'react';
import { FeatureFlagPayload } from '@workspace/shared-types';
import { Flag } from 'lucide-react';

interface FeatureFlagToggleProps {
  flag: FeatureFlagPayload;
  onToggle: (key: string, enabled: boolean) => void;
  isUpdating?: boolean;
}

export function FeatureFlagToggle({ flag, onToggle, isUpdating }: FeatureFlagToggleProps) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4 shadow-sm hover:border-primary/30 transition">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary mt-0.5">
          <Flag className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground font-mono">{flag.key}</h4>
            {flag.organizationId ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Org Override
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
                Global
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {flag.description || 'Controls availability of this module.'}
          </p>
        </div>
      </div>

      <button
        onClick={() => onToggle(flag.key, !flag.enabled)}
        disabled={isUpdating}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          flag.enabled ? 'bg-primary' : 'bg-muted'
        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            flag.enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
