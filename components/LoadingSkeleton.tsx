import React from 'react';
import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-secondary/80', className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
      </div>
      <LoadingSkeleton className="h-64 w-full" />
    </div>
  );
}
