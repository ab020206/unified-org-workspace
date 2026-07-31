'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full relative z-30 border-t border-border bg-surface text-text-secondary text-xs font-sans py-8 px-6 md:px-8 shadow-xs mt-auto flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Section: Branding & System Health */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-medium text-text-primary">
            <div className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="Froncort.ai"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <span className="font-semibold text-xs tracking-tight">Froncort.Ai Workspace</span>
          </div>

          <span className="text-border hidden sm:inline">&bull;</span>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            <span>Systems Operational</span>
          </div>

          <span className="text-border hidden sm:inline">&bull;</span>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-secondary text-primary border border-border">
            v2.4.0-enterprise
          </span>
        </div>

        {/* Middle Section: Quick Nav Links */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary">
          <Link href="/docs" className="hover:text-text-primary transition-colors">
            Documentation
          </Link>
          <a href="#features" className="hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#architecture" className="hover:text-text-primary transition-colors">
            Architecture
          </a>
          <Link href="/audit" className="hover:text-text-primary transition-colors">
            Audit Trail
          </Link>
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privacy & Compliance
          </Link>
        </div>

        {/* Right Section: Compliance & Copyright */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-text-secondary">
          <div className="flex items-center gap-1 text-success">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SOC2 Type II</span>
          </div>
          <span className="text-border">&bull;</span>
          <span>© 2026 Froncort.Ai Inc.</span>
        </div>
      </div>
    </footer>
  );
};
