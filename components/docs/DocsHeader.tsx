'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sun, Moon, Github, Menu, X, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';

interface DocsHeaderProps {
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const DocsHeader: React.FC<DocsHeaderProps> = ({
  onOpenSearch,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    if (typeof document !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-md transition-all duration-200 ${
        isScrolled ? 'shadow-xs' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left branding & mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary lg:hidden"
            aria-label="Toggle Navigation Sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/docs" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-primary/50 transition-colors">
              <img src="/logo.png" alt="Froncort Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-text-primary font-sans tracking-tight">
                  Froncort
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
                  Docs
                </span>
              </div>
              <span className="text-[10px] text-text-secondary font-medium hidden sm:inline-block">
                Enterprise Documentation Center
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Trigger Input Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full h-9 px-3 rounded-lg bg-surface-secondary/70 border border-border hover:border-primary/40 text-text-secondary hover:text-text-primary flex items-center justify-between text-xs font-sans transition-all group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-text group-hover:text-primary transition-colors" />
              <span className="truncate">Search documentation...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-text-secondary shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Application */}
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-surface-secondary border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>App Dashboard</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-transform duration-200 hover:rotate-45"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* GitHub Repository */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Platform Status */}
          <a
            href="/docs/deployment"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-success/10 text-success border border-success/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>v2.4.0</span>
          </a>
        </div>
      </div>
    </header>
  );
};
