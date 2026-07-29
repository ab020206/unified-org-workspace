import { z } from 'zod';
import { Role } from '@workspace/shared-types';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').trim(),
  slug: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid recipient email address').trim().toLowerCase(),
  role: z.nativeEnum(Role).default(Role.GUEST),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
});

export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID format'),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').trim().optional(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional(),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
});

export const onboardOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').trim(),
  slug: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  timezone: z.string().optional(),
  description: z.string().optional(),

  authMode: z.enum(['DIRECT', 'INVITATION']).default('DIRECT'),
  adminFirstName: z.string().min(1, 'Administrator first name is required').trim(),
  adminLastName: z.string().min(1, 'Administrator last name is required').trim(),
  adminEmail: z.string().email('Invalid administrator email address').trim().toLowerCase(),
  adminPhone: z.string().optional(),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export const createMemberDirectSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  role: z.nativeEnum(Role).default(Role.SUPPORT_AGENT),
  phone: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  authMode: z.enum(['DIRECT', 'INVITATION']).default('DIRECT'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export const updateMemberSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});
