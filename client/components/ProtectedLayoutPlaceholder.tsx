'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@workspace/shared-types';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission | Permission[];
}

export function ProtectedLayoutPlaceholder({ children, permission }: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (permission && !hasPermission(permission)) {
        router.push('/403');
      }
    }
  }, [user, isLoading, permission, hasPermission, router]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-4xl mx-auto">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user || (permission && !hasPermission(permission))) {
    return null;
  }

  return <>{children}</>;
}
