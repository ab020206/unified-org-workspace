import { z } from 'zod';
import { SharedResourceType, SharePermission } from '@workspace/shared-types';

export const createConnectionSchema = z.object({
  targetOrganizationIdOrSlug: z
    .string()
    .trim()
    .min(1, 'Target organization ID or slug is required'),
});

export const createShareSchema = z.object({
  resourceType: z.nativeEnum(SharedResourceType, {
    required_error: 'Valid resource type is required',
  }),
  resourceId: z.string().uuid('Invalid resource ID'),
  targetOrganizationId: z.string().uuid('Invalid target organization ID'),
  permission: z.nativeEnum(SharePermission).optional().default(SharePermission.READ),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
});

export const updateShareSchema = z.object({
  permission: z.nativeEnum(SharePermission).optional(),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .nullable()
    .optional(),
});
