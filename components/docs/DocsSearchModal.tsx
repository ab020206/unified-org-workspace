'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, History, ArrowRight, BookOpen, Sparkles, Code, Shield } from 'lucide-react';
import { DOCS_ARTICLES, DocArticle } from '@/lib/docs/docs-data';

interface DocsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsSearchModal: React.FC<DocsSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('froncort_docs_recent_searches');
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const articles = Object.values(DOCS_ARTICLES);

  const searchResults = articles.filter((art) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.subtitle.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q) ||
      art.sections.some((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
    );
  });

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('froncort_docs_recent_searches', JSON.stringify(updated));
    }
  };

  const handleSelectArticle = (slug: string) => {
    if (query) saveRecentSearch(query);
    onClose();
    router.push(`/docs/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleSelectArticle(searchResults[selectedIndex].slug);
      }
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-primary font-semibold rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-border h-14 shrink-0">
          <Search className="w-5 h-5 text-primary shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation (e.g., authentication, RBAC, Gemini API)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-muted-text focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-text-secondary hover:text-text-primary mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-secondary border border-border text-text-secondary">
            ESC
          </kbd>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Recent Searches (when query is empty) */}
          {!query && recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-text-secondary">
                <History className="w-3.5 h-3.5" />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-md bg-surface-secondary text-xs text-text-secondary hover:text-text-primary border border-border hover:border-primary/50 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Default Suggested Shortcuts (when query is empty) */}
          {!query && (
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider">
                Quick Jump
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { slug: 'getting-started', title: 'Getting Started', desc: 'Platform Quickstart' },
                  { slug: 'authentication', title: 'Authentication', desc: 'JWT & Session Management' },
                  { slug: 'api', title: 'REST API Reference', desc: 'Endpoints & Code Samples' },
                  { slug: 'ai-digest', title: 'AI Workspace', desc: 'Executive Digests & Gemini' },
                ].map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => handleSelectArticle(item.slug)}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary/60 hover:bg-surface-secondary border border-border hover:border-primary/40 text-left transition-all group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-text-secondary">{item.desc}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-text group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results List */}
          {query && searchResults.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-text-secondary">
                {searchResults.length} matching result{searchResults.length > 1 ? 's' : ''}
              </div>
              <div className="space-y-1.5">
                {searchResults.map((art, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={art.slug}
                      onClick={() => handleSelectArticle(art.slug)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-xs'
                          : 'bg-surface border-border hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-secondary text-primary border border-border">
                            {art.category}
                          </span>
                          <span className="font-semibold text-xs text-text-primary">
                            {highlightText(art.title, query)}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-secondary font-mono">
                          {art.readingTime}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {highlightText(art.subtitle, query)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State when no results match query */}
          {query && searchResults.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border flex items-center justify-center mx-auto text-muted-text">
                <Search className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-text-primary">
                No documentation found for "{query}"
              </div>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Try searching for terms like <code className="text-primary font-mono">authentication</code>, <code className="text-primary font-mono font-sans font-mono">organizations</code>, <code className="text-primary font-mono">RBAC</code>, or <code className="text-primary font-mono">deployment</code>.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-surface-secondary border-t border-border flex items-center justify-between text-[11px] font-mono text-text-secondary shrink-0">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to close</span>
          </div>
          <span>Froncort Search v2.4</span>
        </div>
      </div>
    </div>
  );
};
