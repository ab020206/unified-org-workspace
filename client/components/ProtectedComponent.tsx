'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Permission, Role } from '@workspace/shared-types';

interface ProtectedComponentProps {
  children: React.ReactNode;
  permission?: Permission | Permission[];
  role?: Role | Role[];
  fallback?: React.ReactNode;
}

export function ProtectedComponent({
  children,
  permission,
  role,
  fallback = null,
}: ProtectedComponentProps) {
  const { hasPermission, hasRole } = useAuth();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
