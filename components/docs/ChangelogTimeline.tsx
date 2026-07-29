'use client';

import React from 'react';
import { CHANGELOG_RELEASES, ChangelogRelease } from '@/lib/docs/docs-data';
import { Sparkles, Shield, Zap, Wrench, Calendar, Tag } from 'lucide-react';

export const ChangelogTimeline: React.FC = () => {
  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-4 h-4 text-primary" />;
      case 'security':
        return <Shield className="w-4 h-4 text-error" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-warning" />;
      case 'fix':
      default:
        return <Wrench className="w-4 h-4 text-info" />;
    }
  };

  return (
    <div className="my-8 relative pl-6 border-l-2 border-border space-y-12">
      {CHANGELOG_RELEASES.map((release, idx) => (
        <div key={release.version} className="relative group">
          {/* Timeline Node Dot */}
          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-primary group-hover:scale-125 transition-transform" />

          {/* Release Container Card */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
            {/* Release Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-lg text-text-primary">
                  {release.version}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                  {release.badgeText}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                <Calendar className="w-3.5 h-3.5" />
                <span>{release.date}</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-base font-bold text-text-primary font-sans">
                {release.title}
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {release.description}
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider block">
                Release Highlights
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {release.highlights.map((h, hIdx) => (
                  <div
                    key={hIdx}
                    className="p-3 rounded-lg bg-surface-secondary/70 border border-border/70 space-y-1"
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-text-primary">
                      {getHighlightIcon(h.type)}
                      <span>{h.title}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed pl-6">
                      {h.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
