import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { OrganizationController } from '../controllers/organization.controller';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { validateRequest } from '../middleware/validateRequest';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  onboardOrganizationSchema,
  createMemberDirectSchema,
  updateMemberSchema,
  inviteMemberSchema,
  acceptInvitationSchema,
  switchOrganizationSchema,
} from '../validators/organization.validator';
import { Permission } from '@workspace/shared-types';

const router = Router();
const orgController = new OrganizationController();

// All organization routes require authentication
router.use(authenticate);

router.post(
  '/',
  validateRequest({ body: createOrganizationSchema }),
  asyncHandler(orgController.create)
);

router.post(
  '/onboard',
  validateRequest({ body: onboardOrganizationSchema }),
  asyncHandler(orgController.onboard)
);

router.get('/', asyncHandler(orgController.list));

router.get(
  '/current',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_READ),
  asyncHandler(orgController.getCurrent)
);

router.patch(
  '/switch',
  validateRequest({ body: switchOrganizationSchema }),
  asyncHandler(orgController.switch)
);

router.post(
  '/members/create',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_INVITE),
  validateRequest({ body: createMemberDirectSchema }),
  asyncHandler(orgController.createMemberDirect)
);

router.patch(
  '/members/:memberId',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_UPDATE),
  validateRequest({ body: updateMemberSchema }),
  asyncHandler(orgController.updateMember)
);

router.delete(
  '/members/:memberId',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_UPDATE),
  asyncHandler(orgController.removeMember)
);

router.post(
  '/members/:memberId/reset-password',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_UPDATE),
  asyncHandler(orgController.resetMemberPassword)
);

router.get(
  '/invitations',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_READ),
  asyncHandler(orgController.listInvitations)
);

router.post(
  '/invitations/:invitationId/resend',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_INVITE),
  asyncHandler(orgController.resendInvitation)
);

router.delete(
  '/invitations/:invitationId',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_INVITE),
  asyncHandler(orgController.cancelInvitation)
);

router.patch(
  '/:id',
  validateRequest({ body: updateOrganizationSchema }),
  asyncHandler(orgController.update)
);

router.post(
  '/invite',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_INVITE),
  validateRequest({ body: inviteMemberSchema }),
  asyncHandler(orgController.invite)
);

router.post(
  '/accept',
  validateRequest({ body: acceptInvitationSchema }),
  asyncHandler(orgController.accept)
);

router.get(
  '/members',
  tenantContext,
  resolvePermissions,
  requirePermission(Permission.ORG_READ),
  asyncHandler(orgController.getMembers)
);

export default router;
