'use client';

import React, { useState, useEffect } from 'react';
import { DocsHeader } from '@/components/docs/DocsHeader';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsSearchModal } from '@/components/docs/DocsSearchModal';
import { Footer } from '@/components/Footer';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    // Global Cmd+K / Ctrl+K keyboard shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    // Reading progress calculation on scroll
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans relative">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Docs Header */}
      <DocsHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sticky Sidebar */}
        <DocsSidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      {/* Search Modal Dialog */}
      <DocsSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
