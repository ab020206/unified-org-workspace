import React from 'react';
import { DigestDto, DigestStatus } from '@workspace/shared-types';
import { Sparkles, RefreshCw, Bot } from 'lucide-react';

interface Props {
  digest: DigestDto | null;
  isGenerating?: boolean;
  onRefresh?: () => void;
}

export function DigestCard({ digest, isGenerating = false, onRefresh }: Props) {
  if (isGenerating || (digest && digest.status === DigestStatus.GENERATING)) {
    return (
      <div className="bg-surface rounded-xl border border-primary/30 p-8 shadow-xl text-text-primary space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Digest Engine
          </span>
        </div>
        <h3 className="text-base font-bold">Generating Your Personalized AI Digest...</h3>
        <p className="text-xs text-text-secondary">
          Our background worker is analyzing assigned tickets, pending code reviews, activity logs,
          and shared tenant resources.
        </p>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="forge-panel forge-accent-ai p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-text-primary">No AI Digest Generated Yet</h3>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          Click below to trigger your first personalized background digest generation.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-hover transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Digest Now</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-primary/30 p-6 shadow-xl text-text-primary space-y-5 forge-accent-ai">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" /> {digest.modelUsed}
          </span>
          <span className="text-xs text-text-secondary font-mono">
            Generated{' '}
            {new Date(digest.generatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-secondary hover:bg-surface text-text-primary border border-border transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>Regenerate Digest</span>
          </button>
        )}
      </div>

      <div className="text-xs md:text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
        {digest.summary}
      </div>

      {digest.tokenUsage && (
        <div className="pt-3 border-t border-border text-[11px] text-text-secondary font-mono flex items-center justify-between">
          <span>Token Usage: {digest.tokenUsage} tokens</span>
          <span>Status: {digest.status}</span>
        </div>
      )}
    </div>
  );
}
