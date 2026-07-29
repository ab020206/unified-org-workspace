'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Github, Moon, Sun, Menu, X } from 'lucide-react';

export const FloatingArchitecturalNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('features');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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

  const navLinks = [
    { name: 'Features', href: '#features', key: 'features' },
    { name: 'Architecture', href: '#architecture', key: 'architecture' },
    { name: 'Security', href: '#security', key: 'security' },
    { name: 'Documentation', href: '/docs', key: 'docs' },
  ];

  return (
    <div className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      <header
        className={`w-full rounded-[18px] border border-border bg-surface/95 dark:bg-[#0F1115]/90 transition-all duration-200 ease-in-out ${
          isScrolled ? 'h-[60px] backdrop-blur-lg shadow-sm' : 'h-[68px] backdrop-blur-md shadow-xs'
        }`}
      >
        <div className="h-full px-6 flex items-center justify-between gap-6">
          {/* ================================================== */}
          {/* LEFT: Logo & Company / Product Branding           */}
          {/* ================================================== */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 rounded-[8px] bg-surface border border-border flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
              <img src="/logo.png" alt="Froncort" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-text-primary font-sans">
                  Froncort Workspace
                </span>
              </div>
              <span className="text-[10px] text-text-secondary font-sans font-medium tracking-wide">
                Enterprise Collaboration Platform
              </span>
            </div>
          </Link>

          {/* ================================================== */}
          {/* CENTER: Clean Architectural Navigation Links      */}
          {/* ================================================== */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium font-sans">
            {navLinks.map((link) => {
              const isActive = activeSection === link.key;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setActiveSection(link.key)}
                  className={`relative py-1 text-text-secondary hover:text-text-primary transition-colors duration-200 ${
                    isActive ? 'text-text-primary font-semibold' : ''
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ================================================== */}
          {/* RIGHT: Actions & Primary CTA                       */}
          {/* ================================================== */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-[10px] text-text-secondary hover:text-text-primary transition-transform duration-200 hover:rotate-45"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-[10px] text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Log In */}
            <Link
              href="/login"
              className="text-sm font-medium font-sans text-text-secondary hover:text-text-primary transition-colors duration-200 px-2 py-1"
            >
              Log In
            </Link>

            {/* Primary CTA */}
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-[10px] text-xs font-medium font-sans text-primary-foreground bg-primary hover:bg-primary-hover shadow-xs flex items-center gap-1.5 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-primary rounded-md border border-border bg-surface"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* MOBILE MENU DROPDOWN                               */}
        {/* ================================================== */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface/98 p-5 space-y-4 rounded-b-[18px]">
            <nav className="flex flex-col space-y-3 text-sm font-medium font-sans">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(link.key);
                    setMobileMenuOpen(false);
                  }}
                  className="text-text-secondary hover:text-text-primary py-1"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full text-center py-2 text-xs font-medium font-sans text-text-primary border border-border rounded-[10px]"
              >
                Log In
              </Link>
              <Link
                href="/dashboard"
                className="w-full text-center py-2 text-xs font-medium font-sans text-primary-foreground bg-primary rounded-[10px]"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
