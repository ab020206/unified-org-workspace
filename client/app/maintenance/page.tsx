'use client';

import React from 'react';
import { Wrench, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Wrench className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">System Maintenance in Progress</h1>
          <p className="text-sm text-muted-foreground">
            We are performing scheduled infrastructure upgrades. System services will resume
            shortly.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition w-full"
        >
          <RefreshCw className="w-4 h-4" />
          Check System Status
        </button>
      </div>
    </div>
  );
}
