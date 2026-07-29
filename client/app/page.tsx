'use client';

import React from 'react';

import { FloatingArchitecturalNavbar } from '@/components/landing/FloatingArchitecturalNavbar';
import { LandingBackground } from '@/components/landing/LandingBackground';
import { HeroBentoGrid } from '@/components/landing/HeroBentoGrid';
import { TrustedMetrics } from '@/components/landing/TrustedMetrics';
import { WorkflowDiagram } from '@/components/landing/WorkflowDiagram';
import { CoreModulesGrid } from '@/components/landing/CoreModulesGrid';
import { HowItWorksTimeline } from '@/components/landing/HowItWorksTimeline';
import { SecurityDiagram } from '@/components/landing/SecurityDiagram';
import { AiCapabilitiesPanel } from '@/components/landing/AiCapabilitiesPanel';
import { ArchitectureHighlights } from '@/components/landing/ArchitectureHighlights';
import { TechStackGrid } from '@/components/landing/TechStackGrid';
import { Footer } from '@/components/Footer';

export default function EnterpriseLandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans relative flex flex-col justify-between">
      {/* Background layer */}
      <LandingBackground />

      {/* Integrated Biosciences-inspired Floating Architectural Navbar */}
      <FloatingArchitecturalNavbar />

      {/* Redesigned Premium Hero Bento Grid */}
      <HeroBentoGrid />

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

      {/* Tech Stack Grid */}
      <TechStackGrid />

      {/* Enterprise Footer */}
      <Footer />
    </div>
  );
}
