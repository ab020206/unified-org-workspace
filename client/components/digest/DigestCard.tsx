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
      <div className="bg-slate-900 rounded-xl border border-cyan-500/30 p-8 shadow-xl text-white space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Digest Engine
          </span>
        </div>
        <h3 className="text-base font-bold">Generating Your Personalized AI Digest...</h3>
        <p className="text-xs text-slate-300">
          Our background worker is analyzing assigned tickets, pending code reviews, activity logs, and shared tenant resources.
        </p>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="forge-panel forge-accent-ai p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          No AI Digest Generated Yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Click below to trigger your first personalized background digest generation.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Digest Now</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-cyan-500/30 p-6 shadow-xl text-white space-y-5 forge-accent-ai">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" /> {digest.modelUsed}
          </span>
          <span className="text-xs text-slate-400 font-mono">
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
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Regenerate Digest</span>
          </button>
        )}
      </div>

      <div className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
        {digest.summary}
      </div>

      {digest.tokenUsage && (
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span>Token Usage: {digest.tokenUsage} tokens</span>
          <span>Status: {digest.status}</span>
        </div>
      )}
    </div>
  );
}
