'use client';

import { useAuth } from '@/context/AuthContext';
import { Permission } from '@workspace/shared-types';

export function usePermission(required?: Permission | Permission[]) {
  const { permissions, hasPermission } = useAuth();

  const isAllowed = required ? hasPermission(required) : true;

  return {
    permissions,
    isAllowed,
    hasPermission,
  };
}
