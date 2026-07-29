'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Rocket,
  Lock,
  Building2,
  Users,
  Shield,
  Ticket,
  GitPullRequest,
  Sparkles,
  ShieldCheck,
  BarChart3,
  ToggleLeft,
  Network,
  Bell,
  Code,
  Webhook,
  Server,
  HelpCircle,
  History,
  Search,
} from 'lucide-react';
import { DOCS_CATEGORIES, DOCS_ARTICLES, DocArticle } from '@/lib/docs/docs-data';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Rocket,
  Lock,
  Building2,
  Users,
  Shield,
  Ticket,
  GitPullRequest,
  Sparkles,
  ShieldCheck,
  BarChart3,
  ToggleLeft,
  Network,
  Bell,
  Code,
  Webhook,
  Server,
  HelpCircle,
  History,
};

interface DocsSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const [filterQuery, setFilterQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const allArticles = Object.values(DOCS_ARTICLES);

  const filteredArticles = allArticles.filter((article) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return article.title.toLowerCase().includes(q) || article.subtitle.toLowerCase().includes(q);
  });

  const articlesByCategory = DOCS_CATEGORIES.map((cat) => {
    const items = filteredArticles.filter((art) => art.category === cat.id);
    return {
      category: cat,
      articles: items,
    };
  });

  const renderNavContent = () => (
    <nav className="space-y-6 text-sm font-sans">
      {/* Sidebar Search Filter */}
      <div className="px-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-text" />
          <input
            type="text"
            placeholder="Filter pages..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-secondary text-xs border border-border text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Docs Home Link */}
      <div>
        <Link
          href="/docs"
          onClick={onCloseMobile}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            pathname === '/docs'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Documentation Home</span>
        </Link>
      </div>

      {/* Categories & Articles */}
      {articlesByCategory.map(({ category, articles }) => {
        if (articles.length === 0) return null;
        const isCollapsed = collapsedCategories[category.id] && !filterQuery;

        return (
          <div key={category.id} className="space-y-1">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-mono font-bold tracking-wider text-text-secondary uppercase hover:text-text-primary transition-colors"
            >
              <span>{category.name}</span>
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {!isCollapsed && (
              <div className="pl-2 space-y-0.5 border-l border-border/60 ml-2">
                {articles.map((art) => {
                  const href = `/docs/${art.slug}`;
                  const isActive = pathname === href;
                  const IconComp = ICON_MAP[art.iconName] || BookOpen;

                  return (
                    <Link
                      key={art.slug}
                      href={href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary -ml-[1px]'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <IconComp
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive
                              ? 'text-primary'
                              : 'text-muted-text group-hover:text-text-primary transition-colors'
                          }`}
                        />
                        <span className="truncate">{art.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky Left Nav) */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-surface/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          {/* Slide-over Panel */}
          <div className="relative w-72 max-w-[80vw] bg-surface border-r border-border h-full p-5 overflow-y-auto shadow-xl z-10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <span className="font-bold text-sm text-text-primary">Docs Navigation</span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-text-secondary hover:text-text-primary rounded-md"
              >
                ✕
              </button>
            </div>
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
