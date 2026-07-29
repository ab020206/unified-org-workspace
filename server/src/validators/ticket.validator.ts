import { z } from 'zod';
import { TicketStatus, TicketPriority, TicketCategory } from '@workspace/shared-types';

export const createTicketSchema = z.object({
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
  category: z.nativeEnum(TicketCategory).optional().default(TicketCategory.GENERAL),
  priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
  assignedTo: z.string().uuid('Invalid assignedTo User ID').nullable().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(1).max(10000).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
});

export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus, { required_error: 'Valid ticket status is required' }),
});

export const assignTicketSchema = z.object({
  assignedTo: z.string().uuid('Invalid user ID').nullable(),
});

export const createCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Comment message cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters'),
});

export const updateCommentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Comment message cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters'),
});

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  status: z.union([z.nativeEnum(TicketStatus), z.array(z.nativeEnum(TicketStatus))]).optional(),
  priority: z
    .union([z.nativeEnum(TicketPriority), z.array(z.nativeEnum(TicketPriority))])
    .optional(),
  category: z
    .union([z.nativeEnum(TicketCategory), z.array(z.nativeEnum(TicketCategory))])
    .optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
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
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'priority', 'status', 'ticketNumber'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
