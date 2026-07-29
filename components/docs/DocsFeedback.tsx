'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Check, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { DOCS_ARTICLES, DocArticle } from '@/lib/docs/docs-data';

interface DocsFeedbackProps {
  currentSlug: string;
  relatedSlugs?: string[];
  lastUpdated?: string;
}

export const DocsFeedback: React.FC<DocsFeedbackProps> = ({
  currentSlug,
  relatedSlugs = [],
  lastUpdated = 'July 2026',
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const relatedArticles: DocArticle[] = relatedSlugs
    .map((slug) => DOCS_ARTICLES[slug])
    .filter(Boolean);

  return (
    <div className="mt-12 pt-8 border-t border-border space-y-8">
      {/* Was this page helpful? */}
      <div className="p-4 sm:p-6 rounded-xl bg-surface-secondary/60 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-bold text-text-primary font-sans">
            Was this page helpful?
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Help us improve our documentation by sharing your feedback.
          </p>
        </div>

        {feedbackGiven ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-success bg-success/10 px-4 py-2 rounded-lg border border-success/20">
            <Check className="w-4 h-4" />
            <span>Thank you for your feedback!</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFeedbackGiven('yes')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-secondary border border-border text-xs font-semibold text-text-primary transition-all hover:scale-105"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-success" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => setFeedbackGiven('no')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-secondary border border-border text-xs font-semibold text-text-primary transition-all hover:scale-105"
            >
              <ThumbsDown className="w-3.5 h-3.5 text-error" />
              <span>No</span>
            </button>
          </div>
        )}
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
            Related Documentation
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedArticles.map((art) => (
              <Link
                key={art.slug}
                href={`/docs/${art.slug}`}
                className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-secondary text-primary border border-border">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono">
                      {art.readingTime}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors font-sans">
                    {art.title}
                  </h5>
                  <p className="text-[11px] text-text-secondary mt-1 line-clamp-2">
                    {art.subtitle}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: {lastUpdated}</span>
        </div>
        <span>Froncort Enterprise Docs</span>
      </div>
    </div>
  );
};
