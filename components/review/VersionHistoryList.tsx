import React from 'react';
import { History } from 'lucide-react';
import { PullRequestVersionDto } from '@workspace/shared-types';

interface Props {
  versions: PullRequestVersionDto[];
}

export function VersionHistoryList({ versions }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
        <History className="w-4 h-4 text-primary" />
        <span>Version History ({versions.length})</span>
      </div>

      {versions.length === 0 ? (
        <p className="text-xs text-text-secondary italic">No previous versions.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                    Version {ver.versionNumber}
                  </span>
                  <span className="text-xs font-bold text-text-primary">
                    {ver.title}
                  </span>
                </div>
                <span className="text-[11px] text-text-secondary">
                  {new Date(ver.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs text-text-secondary whitespace-pre-wrap bg-surface-secondary p-2.5 rounded-xl border border-border">
                {ver.description}
              </p>

              <div className="text-[11px] text-text-secondary flex items-center gap-1">
                <span>Updated by</span>
                <span className="font-semibold text-text-primary">
                  {ver.creator ? `${ver.creator.firstName} ${ver.creator.lastName}` : 'Author'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
