'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
      <div className="w-full max-w-md p-8 rounded-2xl border border-destructive/30 bg-card shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-destructive uppercase tracking-wider">
            Error 403 • Forbidden Access
          </span>
          <h1 className="text-xl font-bold text-foreground">Insufficient Permissions</h1>
          <p className="text-xs text-muted-foreground pt-1">
            You do not have authorization to access this resource or execute this action within your
            active organization role.
          </p>
        </div>

        <div className="pt-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
