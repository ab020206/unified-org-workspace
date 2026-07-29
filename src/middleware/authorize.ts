import { RequestHandler } from 'express';
import { AppRequest } from '../types/index';
import { PermissionService } from '../services/permission.service';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { Permission, Role } from '@workspace/shared-types';

const permissionService = new PermissionService();

export const resolvePermissions: RequestHandler = async (req, _res, next) => {
  const appReq = req as AppRequest;

  if (!appReq.membership || !appReq.user) {
    return next(ApiError.unauthorized('Membership context missing prior to permission resolution'));
  }

  try {
    const permissions = await permissionService.getEffectivePermissions(
      appReq.membership.id,
      appReq.membership.role
    );
    appReq.permissions = permissions;
    next();
  } catch (error) {
    next(error);
  }
};

export function requirePermission(required: Permission | Permission[]): RequestHandler {
  return (req, _res, next) => {
    const appReq = req as AppRequest;

    if (!appReq.permissions) {
      return next(ApiError.unauthorized('Permission context not resolved'));
    }

    const hasAccess = permissionService.hasPermission(appReq.permissions as Permission[], required);
    if (!hasAccess) {
      logger.warn(
        {
          userId: appReq.user?.id,
          orgId: appReq.organization?.id,
          role: appReq.membership?.role,
          requiredPermission: required,
          effectivePermissions: appReq.permissions,
        },
        'Permission Denied: Insufficient permissions for request'
      );
      return next(new ApiError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }

    next();
  };
}

export function requireRole(allowedRoles: Role | Role[]): RequestHandler {
  return (req, _res, next) => {
    const appReq = req as AppRequest;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!appReq.membership || !rolesArray.includes(appReq.membership.role)) {
      logger.warn(
        {
          userId: appReq.user?.id,
          userRole: appReq.membership?.role,
          requiredRoles: allowedRoles,
        },
        'Role Authorization Failed'
      );
      return next(new ApiError(403, 'Forbidden: Role not authorized', 'FORBIDDEN'));
    }

    next();
  };
}
