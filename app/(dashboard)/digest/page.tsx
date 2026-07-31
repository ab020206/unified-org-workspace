'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { digestApi } from '@/lib/digestApi';
import { DigestDto } from '@workspace/shared-types';
import { DigestCard } from '@/components/digest/DigestCard';
import { CommandBar } from '@/components/ui/CommandBar';
import { Sparkles, History } from 'lucide-react';

export default function DigestPage() {
  const { activeOrganization } = useAuth();
  const [digest, setDigest] = useState<DigestDto | null>(null);
  const [history, setHistory] = useState<DigestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeOrganization?.id) return;
    setIsLoading(true);
    try {
      const [latest, hist] = await Promise.all([
        digestApi.getLatestDigest(activeOrganization.id),
        digestApi.getHistory(1, 10, activeOrganization.id),
      ]);
      setDigest(latest);
      setHistory(hist.items);
    } catch (err) {
      console.error('Failed to load digest:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegenerate = async () => {
    if (!activeOrganization?.id) return;
    setIsGenerating(true);
    try {
      await digestApi.triggerGenerate(activeOrganization.id);
      setTimeout(async () => {
        await loadData();
        setIsGenerating(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger digest generation');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* FORGE UI Command Bar */}
      <CommandBar
        moduleName="AI Executive Digest"
        moduleAccent="ai"
        breadcrumbs={['Workspace', 'AI Engine', 'Executive Briefing']}
        searchPlaceholder="Search AI briefings, tickets summary..."
        primaryActionLabel={isGenerating ? 'Generating Digest...' : 'Generate Fresh Digest'}
        onPrimaryAction={handleRegenerate}
      />

      {/* Featured Latest Digest */}
      {isLoading ? (
        <div className="forge-panel forge-accent-ai p-8 text-center animate-pulse text-xs text-muted-foreground font-mono">
          Loading AI system digest...
        </div>
      ) : (
        <div className="forge-accent-ai rounded-xl">
          <DigestCard digest={digest} isGenerating={isGenerating} onRefresh={handleRegenerate} />
        </div>
      )}

      {/* Digest History */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <History className="w-4 h-4 text-primary" />
          <span>Historical AI Briefings</span>
        </div>

        {history.length === 0 ? (
          <div className="forge-panel p-6 text-xs text-muted-foreground italic font-mono">
            No previous digest briefings generated. Click &quot;Generate Fresh Digest&quot; above.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => setDigest(h)}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-primary/10 text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Briefing #{h.id.slice(0, 8)} •{' '}
                      <span className="font-mono text-emerald-500">READY</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Model: {h.modelUsed} • {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDigest(h);
                  }}
                  className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 text-[11px] transition-colors"
                >
                  View Briefing
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
