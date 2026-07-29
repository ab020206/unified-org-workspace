import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FeatureDisabledBannerProps {
  featureName: string;
}

export function FeatureDisabledBanner({ featureName }: FeatureDisabledBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-border rounded-xl bg-card shadow-sm max-w-xl mx-auto my-12">
      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
        <Lock className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-foreground">Feature Currently Disabled</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        The feature <span className="font-mono font-semibold text-foreground">{featureName}</span>{' '}
        has been turned off by your system administrator.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
