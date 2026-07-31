import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/src/auth';
import { UnauthorizedError, ForbiddenError } from '@/src/lib/errors';
import { Role } from '@workspace/shared-types';

export interface AuthContext {
  userId: string;
  email: string;
  role: Role;
  organizationId?: string;
}

export function getAuthContext(request: NextRequest): AuthContext {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    const cookieOrgId = request.cookies.get('active_org_id')?.value;
    const orgId = request.headers.get('x-organization-id') || cookieOrgId || payload.activeOrgId || payload.organizationId;
    return {
      userId: payload.userId || payload.sub || payload.id,
      email: payload.email,
      role: payload.role as Role,
      organizationId: orgId,
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function requireAuth(request: NextRequest): AuthContext {
  return getAuthContext(request);
}

export function requireOrgAuth(request: NextRequest): Required<AuthContext> {
  const auth = getAuthContext(request);
  if (!auth.organizationId) {
    throw new ForbiddenError('Organization context is required');
  }
  return auth as Required<AuthContext>;
}

export function requireRole(auth: AuthContext, allowedRoles: Role[]) {
  if (!allowedRoles.includes(auth.role)) {
    throw new ForbiddenError(`Action requires one of the following roles: ${allowedRoles.join(', ')}`);
  }
}
