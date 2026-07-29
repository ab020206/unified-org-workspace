import React from 'react';
import { History } from 'lucide-react';
import { PullRequestVersionDto } from '@workspace/shared-types';

interface Props {
  versions: PullRequestVersionDto[];
}

export function VersionHistoryList({ versions }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <History className="w-4 h-4 text-purple-500" />
        <span>Version History ({versions.length})</span>
      </div>

      {versions.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No previous versions.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Version {ver.versionNumber}
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {ver.title}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {new Date(ver.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                {ver.description}
              </p>

              <div className="text-[11px] text-gray-400 flex items-center gap-1">
                <span>Updated by</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
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
