'use client';

import React, { useState, useEffect } from 'react';
import { DocTocItem } from '@/lib/docs/docs-data';
import { AlignLeft, Copy, Check, Printer, Github, Share2 } from 'lucide-react';

interface DocsTocProps {
  toc: DocTocItem[];
  githubEditUrl?: string;
}

export const DocsToc: React.FC<DocsTocProps> = ({ toc, githubEditUrl }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -40% 0px' }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!toc || toc.length === 0) return null;

  return (
    <aside className="hidden xl:block w-60 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4 border-l border-border/50 text-xs font-sans">
      <div className="space-y-4">
        {/* TOC Header */}
        <div className="flex items-center gap-2 text-text-secondary font-mono text-[11px] font-bold uppercase tracking-wider">
          <AlignLeft className="w-3.5 h-3.5" />
          <span>On This Page</span>
        </div>

        {/* Section Links */}
        <nav className="space-y-1">
          {toc.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(item.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    setActiveId(item.id);
                  }
                }}
                className={`block py-1 transition-colors leading-relaxed truncate ${
                  item.level === 3 ? 'pl-3' : 'pl-0'
                } ${
                  isActive
                    ? 'text-primary font-semibold border-l-2 border-primary -ml-2 pl-2'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.title}
              </a>
            );
          })}
        </nav>

        {/* Quick Page Actions */}
        <div className="pt-4 border-t border-border space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2 text-text-secondary hover:text-text-primary py-1 font-medium transition-colors"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Page Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full flex items-center gap-2 text-text-secondary hover:text-text-primary py-1 font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Page</span>
          </button>

          {githubEditUrl && (
            <a
              href={githubEditUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary py-1 font-medium transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Edit this page</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};
