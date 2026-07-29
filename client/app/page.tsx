'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Play,
  Github,
} from 'lucide-react';

import { LandingBackground } from '@/components/landing/LandingBackground';
import { InteractiveHeroDashboard } from '@/components/landing/InteractiveHeroDashboard';
import { TrustedMetrics } from '@/components/landing/TrustedMetrics';
import { WorkflowDiagram } from '@/components/landing/WorkflowDiagram';
import { CoreModulesGrid } from '@/components/landing/CoreModulesGrid';
import { HowItWorksTimeline } from '@/components/landing/HowItWorksTimeline';
import { SecurityDiagram } from '@/components/landing/SecurityDiagram';
import { AiCapabilitiesPanel } from '@/components/landing/AiCapabilitiesPanel';
import { ArchitectureHighlights } from '@/components/landing/ArchitectureHighlights';
import { AutonomousDemoModal } from '@/components/landing/AutonomousDemoModal';
import { TechStackGrid } from '@/components/landing/TechStackGrid';
import { Footer } from '@/components/Footer';

export default function EnterpriseLandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#1F1F1F] font-sans relative flex flex-col justify-between">
      {/* Background layer */}
      <LandingBackground />

      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-[#D9D9D9]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#174D38] flex items-center justify-center text-white font-bold shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#1F1F1F]">
                Froncort.ai Workspace
              </span>
              <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F2F2F2] text-[#174D38] border border-[#D9D9D9]">
                Enterprise SaaS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#6B7280]">
            <a href="#features" className="hover:text-[#1F1F1F] transition-colors">Features</a>
            <a href="#architecture" className="hover:text-[#1F1F1F] transition-colors">Architecture</a>
            <a href="#demo" className="hover:text-[#1F1F1F] transition-colors">Demo</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1F1F1F] transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>GitHub</span>
            </a>
            <Link href="/docs" className="hover:text-[#1F1F1F] transition-colors">Documentation</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-md text-xs font-medium text-[#1F1F1F] hover:bg-[#F2F2F2] transition-all border border-[#D9D9D9]"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-md text-xs font-medium text-white bg-[#174D38] hover:bg-[#123A2B] transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D9D9D9] bg-white text-[#174D38] text-xs font-mono font-medium shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#174D38]" />
            <span>Built for Enterprise Product & Engineering Teams</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.05 }}
            className="space-y-4 max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1F1F1F] leading-tight">
              Enterprise Workspace Built for <br />
              <span className="text-[#174D38]">
                Intelligent Collaboration
              </span>
            </h1>
            <p className="text-sm md:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              A unified platform combining multi-tenant support, review workflows, AI-powered insights, enterprise security, and audit-ready collaboration.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-md text-xs font-medium text-white bg-[#174D38] hover:bg-[#123A2B] transition-all shadow-xs flex items-center gap-2"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-6 py-3 rounded-md text-xs font-medium text-[#1F1F1F] bg-white hover:bg-[#F2F2F2] border border-[#D9D9D9] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-[#174D38] fill-[#174D38]" />
              <span>Take Interactive Product Tour</span>
            </button>
          </motion.div>

          {/* Live Interactive Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="pt-4"
          >
            <InteractiveHeroDashboard />
          </motion.div>
        </div>
      </section>

      {/* Trusted Metrics */}
      <TrustedMetrics />

      {/* Product Overview Pipeline Diagram */}
      <WorkflowDiagram />

      {/* Core Modules Grid */}
      <CoreModulesGrid />

      {/* How It Works Timeline */}
      <HowItWorksTimeline />

      {/* Enterprise Security Section */}
      <SecurityDiagram />

      {/* AI Capabilities Section */}
      <AiCapabilitiesPanel />

      {/* Architecture Section */}
      <ArchitectureHighlights />

      {/* Interactive Demo Highlight Banner Section */}
      <section id="demo" className="py-16 border-b border-[#D9D9D9] bg-[#F2F2F2] relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="p-8 md:p-12 rounded-[10px] border border-[#D9D9D9] bg-white space-y-6 text-center relative overflow-hidden shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#D9D9D9] bg-[#F2F2F2] text-[#174D38] text-xs font-mono font-medium">
              Interactive Product Highlight
            </div>

            <h2 className="text-3xl md:text-4xl font-semibold text-[#1F1F1F] tracking-tight max-w-2xl mx-auto">
              Experience the Platform
            </h2>

            <p className="text-xs md:text-sm text-[#6B7280] max-w-xl mx-auto leading-relaxed">
              Watch the application demonstrate itself by performing real operations across multiple user roles in an interactive autonomous simulation.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-3.5 rounded-md text-sm font-medium text-white bg-[#174D38] hover:bg-[#123A2B] transition-all shadow-xs inline-flex items-center gap-3 cursor-pointer"
              >
                <span>Run Autonomous Product Simulation</span>
              </button>
            </div>

            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] font-mono text-[#6B7280] border-t border-[#D9D9D9] max-w-3xl mx-auto">
              <div>✓ Real Auth Tokens</div>
              <div>✓ Real CRUD Operations</div>
              <div>✓ Multi-Role Switching</div>
              <div>✓ Audit Stream Logs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <TechStackGrid />

      {/* Enterprise Footer */}
      <Footer />

      {/* Autonomous Demo Modal */}
      <AutonomousDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
