import { Response } from 'express';
import { AppRequest } from '../types/index';
import { TicketService } from '../services/ticket.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import { ApiError } from '../utils/apiError';
import {
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  createCommentSchema,
  updateCommentSchema,
  ticketListQuerySchema,
} from '../validators/ticket.validator';

const ticketService = new TicketService();

export class TicketController {
  static createTicket = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const validated = createTicketSchema.parse(req.body);

    const ticket = await ticketService.createTicket(orgId, userId, validated as any);
    res
      .status(201)
      .json(createSuccessResponse(ticket, 'Ticket created successfully', req.requestId || 'N/A'));
  };

  static getTickets = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const query = ticketListQuerySchema.parse(req.query);

    const result = await ticketService.getTickets(orgId, query);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Tickets retrieved successfully', req.requestId || 'N/A')
      );
  };

  static getDashboardStats = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;

    const stats = await ticketService.getDashboardStats(orgId, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(
          stats,
          'Dashboard stats retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getTicketById = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const ticket = await ticketService.getTicketById(orgId, id);
    res
      .status(200)
      .json(createSuccessResponse(ticket, 'Ticket retrieved successfully', req.requestId || 'N/A'));
  };

  static updateTicket = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const validated = updateTicketSchema.parse(req.body);

    const updated = await ticketService.updateTicket(orgId, id, userId, validated);
    res
      .status(200)
      .json(createSuccessResponse(updated, 'Ticket updated successfully', req.requestId || 'N/A'));
  };

  static updateTicketStatus = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = updateTicketStatusSchema.parse(req.body);

    const updated = await ticketService.updateTicketStatus(orgId, id, userId, status);
    res
      .status(200)
      .json(
        createSuccessResponse(updated, 'Ticket status updated successfully', req.requestId || 'N/A')
      );
  };

  static assignTicket = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { assignedTo } = assignTicketSchema.parse(req.body);

    const updated = await ticketService.assignTicket(orgId, id, userId, assignedTo);
    res
      .status(200)
      .json(
        createSuccessResponse(
          updated,
          'Ticket assignment updated successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static deleteTicket = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await ticketService.deleteTicket(orgId, id, userId);
    res
      .status(200)
      .json(createSuccessResponse(result, 'Ticket deleted successfully', req.requestId || 'N/A'));
  };

  static addComment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { message } = createCommentSchema.parse(req.body);

    const comment = await ticketService.addComment(orgId, id, userId, message);
    res
      .status(201)
      .json(createSuccessResponse(comment, 'Comment added successfully', req.requestId || 'N/A'));
  };

  static getComments = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const ticket = await ticketService.getTicketById(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(
          ticket.comments || [],
          'Comments retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static updateComment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { message } = updateCommentSchema.parse(req.body);

    const comment = await ticketService.updateComment(orgId, id, userId, message);
    res
      .status(200)
      .json(createSuccessResponse(comment, 'Comment updated successfully', req.requestId || 'N/A'));
  };

  static deleteComment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await ticketService.deleteComment(orgId, id, userId);
    res
      .status(200)
      .json(createSuccessResponse(result, 'Comment deleted successfully', req.requestId || 'N/A'));
  };

  static addAttachment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    if (!req.file) {
      throw ApiError.badRequest('No file uploaded');
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = await ticketService.addAttachment(orgId, id, userId, {
      fileName: req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res
      .status(201)
      .json(
        createSuccessResponse(
          attachment,
          'Attachment uploaded successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getAttachments = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const ticket = await ticketService.getTicketById(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(
          ticket.attachments || [],
          'Attachments retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static deleteAttachment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await ticketService.deleteAttachment(orgId, id, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Attachment deleted successfully', req.requestId || 'N/A')
      );
  };

  static getActivityTimeline = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const activities = await ticketService.getActivityTimeline(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(
          activities || [],
          'Activity timeline retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };
}
