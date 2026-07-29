import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { TicketController } from '../controllers/ticket.controller';
import { uploadAttachmentMiddleware } from '../middleware/upload';
import { Permission } from '@workspace/shared-types';

export const ticketRouter = Router();

// Apply auth, tenant resolution, and permission resolution middleware to all ticket routes
ticketRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

// Dashboard Stats
ticketRouter.get(
  '/stats',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.getDashboardStats)
);

// Ticket CRUD
ticketRouter.post(
  '/',
  requirePermission(Permission.TICKET_CREATE),
  asyncHandler(TicketController.createTicket)
);

ticketRouter.get(
  '/',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.getTickets)
);

ticketRouter.get(
  '/:id',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.getTicketById)
);

ticketRouter.patch(
  '/:id',
  requirePermission(Permission.TICKET_UPDATE),
  asyncHandler(TicketController.updateTicket)
);

ticketRouter.delete(
  '/:id',
  requirePermission(Permission.TICKET_DELETE),
  asyncHandler(TicketController.deleteTicket)
);

// Status Transition & Assignment
ticketRouter.patch(
  '/:id/status',
  requirePermission(Permission.TICKET_UPDATE),
  asyncHandler(TicketController.updateTicketStatus)
);

ticketRouter.patch(
  '/:id/assign',
  requirePermission(Permission.TICKET_ASSIGN),
  asyncHandler(TicketController.assignTicket)
);

// Comments
ticketRouter.post(
  '/:id/comments',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.addComment)
);

ticketRouter.get(
  '/:id/comments',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.getComments)
);

// Attachments
ticketRouter.post(
  '/:id/attachments',
  requirePermission(Permission.TICKET_UPDATE),
  uploadAttachmentMiddleware,
  asyncHandler(TicketController.addAttachment)
);

ticketRouter.get(
  '/:id/attachments',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.getAttachments)
);

// Activity Timeline
ticketRouter.get(
  '/:id/activity',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.getActivityTimeline)
);

// Additional sub-routers for standalone comment and attachment routes
export const commentRouter = Router();
commentRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

commentRouter.patch(
  '/:id',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.updateComment)
);

commentRouter.delete(
  '/:id',
  requirePermission(Permission.TICKET_READ),
  asyncHandler(TicketController.deleteComment)
);

export const attachmentRouter = Router();
attachmentRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

attachmentRouter.delete(
  '/:id',
  requirePermission(Permission.TICKET_UPDATE),
  asyncHandler(TicketController.deleteAttachment)
);
