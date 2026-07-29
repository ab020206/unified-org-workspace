'use client';

import { useAuth } from '@/context/AuthContext';
import { Role } from '@workspace/shared-types';

export function useRole(allowedRoles?: Role | Role[]) {
  const { user, activeOrganization, hasRole } = useAuth();

  const isAllowed = allowedRoles ? hasRole(allowedRoles) : true;
  const currentRole = user?.isPlatformUser
    ? Role.SUPER_ADMIN
    : (activeOrganization?.userRole as Role | undefined);

  return {
    role: currentRole,
    isAllowed,
    hasRole,
  };
}
