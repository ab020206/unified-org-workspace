import { z } from 'zod';
import { PullRequestStatus, ReviewDecisionType } from '@workspace/shared-types';

export const createPRSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(10000, 'Description cannot exceed 10000 characters'),
  requiredApprovals: z.number().int().min(1).max(10).optional().default(1),
  reviewerIds: z.array(z.string().uuid('Invalid reviewer user ID')).optional().default([]),
  isDraft: z.boolean().optional().default(false),
});

export const updatePRSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(1).max(10000).optional(),
  requiredApprovals: z.number().int().min(1).max(10).optional(),
});

export const assignReviewersSchema = z.object({
  reviewerIds: z
    .array(z.string().uuid('Invalid reviewer user ID'))
    .min(1, 'At least one reviewer ID is required'),
});

export const submitReviewDecisionSchema = z.object({
  decision: z.nativeEnum(ReviewDecisionType, { required_error: 'Valid decision type is required' }),
  comment: z.string().trim().max(2000).optional(),
});

export const createPRCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Comment message cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters'),
});

export const updatePRCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Comment message cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters'),
});

export const prListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  status: z
    .union([z.nativeEnum(PullRequestStatus), z.array(z.nativeEnum(PullRequestStatus))])
    .optional(),
  createdBy: z.string().optional(),
  reviewerId: z.string().optional(),
  startDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'prNumber', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
