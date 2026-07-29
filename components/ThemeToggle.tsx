'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center opacity-50" />
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-secondary border border-border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs cursor-pointer"
        title={`Current theme: ${theme}. Click to change theme options.`}
      >
        <span className="relative flex items-center justify-center w-4 h-4 transition-transform duration-200">
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-primary transition-all duration-200 rotate-0 scale-100" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-warning transition-all duration-200 rotate-0 scale-100" />
          ) : (
            <Laptop className="w-4 h-4 text-text-secondary transition-all duration-200" />
          )}
        </span>
        <span className="text-[11px] font-mono capitalize hidden sm:inline text-text-secondary font-medium">
          {theme || 'System'}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-36 rounded-lg bg-surface border border-border shadow-md z-50 p-1 space-y-0.5 select-none font-sans text-xs">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-surface-secondary text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-warning" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-surface-secondary text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-primary" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-surface-secondary text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-text-secondary" />
              <span>System</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
