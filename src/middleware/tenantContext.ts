import { RequestHandler } from 'express';
import { AppRequest } from '../types/index';
import { OrganizationService } from '../services/organization.service';
import { MemberRepository } from '../repositories/member.repository';
import { ApiError } from '../utils/apiError';
import { Role } from '@workspace/shared-types';

const organizationService = new OrganizationService();
const memberRepository = new MemberRepository();

export const tenantContext: RequestHandler = async (req, _res, next) => {
  const appReq = req as AppRequest;

  if (!appReq.user) {
    return next(ApiError.unauthorized('User context is missing prior to organization resolution'));
  }

  try {
    // 1. Resolve Org ID from Header, Cookie, Query, or Param
    let orgId =
      (req.headers['x-organization-id'] as string | undefined) ||
      (req.cookies?.active_org_id as string | undefined) ||
      (req.query.organizationId as string | undefined);

    // Platform Super Admin logic
    if (appReq.user.isPlatformUser) {
      if (orgId && orgId !== 'platform') {
        try {
          const orgDetails = await organizationService.getOrganizationDetails(orgId, appReq.user.id);
          const membership = await memberRepository.findMembership(orgId, appReq.user.id);
          appReq.organization = orgDetails as any;
          appReq.membership = {
            id: membership?.id || `platform-${appReq.user.id}`,
            organizationId: orgId,
            userId: appReq.user.id,
            role: (membership?.role as Role) || Role.SUPER_ADMIN,
            joinedAt: membership?.joinedAt ? membership.joinedAt.toISOString() : new Date().toISOString(),
            isActive: true,
          };
          return next();
        } catch {
          // Fall through to platform default if org not found
        }
      }

      appReq.organization = undefined;
      appReq.membership = {
        id: `platform-${appReq.user.id}`,
        organizationId: '',
        userId: appReq.user.id,
        role: Role.SUPER_ADMIN,
        joinedAt: new Date().toISOString(),
        isActive: true,
      };
      return next();
    }

    // 2. Fallback to user's first available organization if no header/cookie was supplied
    if (!orgId || orgId === 'platform') {
      const userOrgs = await organizationService.getUserOrganizations(appReq.user.id);
      if (userOrgs.length === 0) {
        throw ApiError.forbidden('User does not belong to any active organization');
      }
      orgId = userOrgs[0].id;
    }

    // 3. Verify membership
    const membership = await memberRepository.findMembership(orgId, appReq.user.id);
    if (!membership || !membership.isActive) {
      throw ApiError.forbidden(
        'User does not have an active membership in the target organization'
      );
    }

    // 4. Fetch full organization details & member count
    const orgDetails = await organizationService.getOrganizationDetails(orgId, appReq.user.id);

    // 5. Attach to request
    appReq.organization = orgDetails as any;
    appReq.membership = {
      id: membership.id,
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role as Role,
      joinedAt: membership.joinedAt.toISOString(),
      isActive: membership.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};
