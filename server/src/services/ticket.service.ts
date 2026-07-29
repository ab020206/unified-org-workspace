import { TicketRepository } from '../repositories/ticket.repository';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  CreateTicketDto,
  UpdateTicketDto,
  TicketListQueryDto,
  SharePermission,
} from '@workspace/shared-types';

import { auditService } from './audit.service';

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.WAITING_FOR_RESPONSE,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.WAITING_FOR_RESPONSE,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
    TicketStatus.OPEN,
  ],
  [TicketStatus.WAITING_FOR_RESPONSE]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS, TicketStatus.REOPENED],
  [TicketStatus.CLOSED]: [TicketStatus.REOPENED],
  [TicketStatus.REOPENED]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED],
};

export class TicketService {
  private ticketRepository: TicketRepository;

  constructor() {
    this.ticketRepository = new TicketRepository();
  }

  async createTicket(organizationId: string, currentUserId: string, dto: CreateTicketDto) {
    const ticket = await this.ticketRepository.createTicket({
      organizationId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priority: dto.priority,
      createdBy: currentUserId,
      assignedTo: dto.assignedTo,
    });

    // Record creation activity
    await this.ticketRepository.createActivity({
      ticketId: ticket.id,
      actorId: currentUserId,
      action: 'CREATED',
      newValue: ticket.title,
    });

    if (ticket.assignedTo) {
      await this.ticketRepository.createActivity({
        ticketId: ticket.id,
        actorId: currentUserId,
        action: 'ASSIGNED',
        newValue: ticket.assignee
          ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
          : ticket.assignedTo,
      });
    }

    await auditService.log({
      organizationId,
      actorId: currentUserId,
      actorEmail: ticket.creator?.email || 'user@example.com',
      actorRole: 'USER',
      module: 'SUPPORT_HUB',
      action: 'TICKET_CREATED',
      entityType: 'TICKET',
      entityId: ticket.id,
      newState: {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
      },
    });

    logger.info(
      { ticketId: ticket.id, organizationId, createdBy: currentUserId },
      'Ticket Created'
    );
    return ticket;
  }

  async getTicketById(organizationId: string, ticketId: string, currentUserId?: string) {
    let ticket = await this.ticketRepository.findTicketById(organizationId, ticketId);
    if (!ticket) {
      // Check if ticket is shared with active organization
      const { CollaborationRepository } = await import('../repositories/collaboration.repository');
      const collabRepo = new CollaborationRepository();
      const share = await collabRepo.findActiveShareForResource(
        'TICKET' as any,
        ticketId,
        organizationId
      );

      if (share) {
        ticket = await this.ticketRepository.findTicketById(share.ownerOrganizationId, ticketId);
        if (ticket && currentUserId) {
          await collabRepo.recordAccess(
            share.id,
            currentUserId,
            share.permission as unknown as SharePermission
          );
        }
      }
    }

    if (!ticket) {
      throw ApiError.notFound('Ticket not found in current organization');
    }
    return ticket;
  }

  async getTickets(organizationId: string, query: TicketListQueryDto) {
    return this.ticketRepository.findTickets(organizationId, query);
  }

  async updateTicket(
    organizationId: string,
    ticketId: string,
    currentUserId: string,
    dto: UpdateTicketDto
  ) {
    const existing = await this.getTicketById(organizationId, ticketId);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.priority !== undefined) {
      updateData.priority = dto.priority;
      if (existing.priority !== dto.priority) {
        await this.ticketRepository.createActivity({
          ticketId,
          actorId: currentUserId,
          action: 'PRIORITY_CHANGED',
          oldValue: existing.priority,
          newValue: dto.priority,
        });
      }
    }

    const updated = await this.ticketRepository.updateTicket(organizationId, ticketId, updateData);
    logger.info({ ticketId, organizationId, updatedBy: currentUserId }, 'Ticket Details Updated');
    return updated;
  }

  async updateTicketStatus(
    organizationId: string,
    ticketId: string,
    currentUserId: string,
    newStatus: TicketStatus
  ) {
    const ticket = await this.getTicketById(organizationId, ticketId);

    if (ticket.status === newStatus) {
      return ticket;
    }

    const allowed = ALLOWED_TRANSITIONS[ticket.status as TicketStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw ApiError.badRequest(
        `Invalid status transition from '${ticket.status}' to '${newStatus}'`
      );
    }

    const updateData: any = { status: newStatus };
    if (newStatus === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    } else if (newStatus === TicketStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    const updated = await this.ticketRepository.updateTicket(organizationId, ticketId, updateData);

    // Record activity
    let action = 'STATUS_CHANGED';
    if (newStatus === TicketStatus.CLOSED) action = 'CLOSED';
    else if (newStatus === TicketStatus.REOPENED) action = 'REOPENED';

    await this.ticketRepository.createActivity({
      ticketId,
      actorId: currentUserId,
      action,
      oldValue: ticket.status,
      newValue: newStatus,
    });

    logger.info(
      { ticketId, oldStatus: ticket.status, newStatus, actorId: currentUserId },
      'Ticket Status Updated'
    );
    return updated;
  }

  async assignTicket(
    organizationId: string,
    ticketId: string,
    currentUserId: string,
    assignedTo: string | null
  ) {
    const ticket = await this.getTicketById(organizationId, ticketId);
    const oldAssignee = ticket.assignedTo;

    if (oldAssignee === assignedTo) {
      return ticket;
    }

    const updated = await this.ticketRepository.updateTicket(organizationId, ticketId, {
      assignedTo,
    });

    let action = 'ASSIGNED';
    if (oldAssignee && assignedTo) action = 'REASSIGNED';
    else if (oldAssignee && !assignedTo) action = 'UNASSIGNED';

    await this.ticketRepository.createActivity({
      ticketId,
      actorId: currentUserId,
      action,
      oldValue: oldAssignee || 'Unassigned',
      newValue: assignedTo || 'Unassigned',
    });

    logger.info(
      { ticketId, oldAssignee, newAssignee: assignedTo, actorId: currentUserId },
      'Ticket Assignment Updated'
    );

    if (assignedTo && assignedTo !== currentUserId) {
      const { notificationService } = await import('./notification.service');
      const { NotificationType } = await import('@workspace/shared-types');
      await notificationService.sendNotification({
        userId: assignedTo,
        organizationId,
        type: NotificationType.TICKET_ASSIGNED,
        title: '🎫 Ticket Assigned to You',
        message: `You have been assigned to ticket "${ticket.title}".`,
        referenceType: 'TICKET',
        referenceId: ticketId,
      });
    }

    return updated;
  }

  async deleteTicket(organizationId: string, ticketId: string, _currentUserId: string) {
    const ticket = await this.getTicketById(organizationId, ticketId);
    await this.ticketRepository.deleteTicket(organizationId, ticket.id);
    return { success: true, message: 'Ticket deleted successfully' };
  }

  async addComment(
    organizationId: string,
    ticketId: string,
    currentUserId: string,
    message: string
  ) {
    await this.getTicketById(organizationId, ticketId);

    const comment = await this.ticketRepository.createComment(ticketId, currentUserId, message);

    await this.ticketRepository.createActivity({
      ticketId,
      actorId: currentUserId,
      action: 'COMMENT_ADDED',
      newValue: message.length > 50 ? `${message.substring(0, 47)}...` : message,
    });

    return comment;
  }

  async updateComment(
    organizationId: string,
    commentId: string,
    currentUserId: string,
    message: string
  ) {
    const comment = await this.ticketRepository.findCommentById(commentId);
    if (!comment || comment.ticket.organizationId !== organizationId) {
      throw ApiError.notFound('Comment not found');
    }

    if (comment.userId !== currentUserId) {
      throw ApiError.forbidden('You can only edit your own comments');
    }

    return this.ticketRepository.updateComment(commentId, message);
  }

  async deleteComment(organizationId: string, commentId: string, currentUserId: string) {
    const comment = await this.ticketRepository.findCommentById(commentId);
    if (!comment || comment.ticket.organizationId !== organizationId) {
      throw ApiError.notFound('Comment not found');
    }

    if (comment.userId !== currentUserId) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    await this.ticketRepository.deleteComment(commentId);
    return { success: true, message: 'Comment deleted successfully' };
  }

  async addAttachment(
    organizationId: string,
    ticketId: string,
    currentUserId: string,
    fileData: { fileName: string; fileUrl: string; mimeType: string; fileSize: number }
  ) {
    await this.getTicketById(organizationId, ticketId);

    const attachment = await this.ticketRepository.createAttachment({
      ticketId,
      uploadedBy: currentUserId,
      ...fileData,
    });

    await this.ticketRepository.createActivity({
      ticketId,
      actorId: currentUserId,
      action: 'ATTACHMENT_UPLOADED',
      newValue: fileData.fileName,
    });

    return attachment;
  }

  async deleteAttachment(organizationId: string, attachmentId: string, _currentUserId: string) {
    const attachment = await this.ticketRepository.findAttachmentById(attachmentId);
    if (!attachment || attachment.ticket.organizationId !== organizationId) {
      throw ApiError.notFound('Attachment not found');
    }

    await this.ticketRepository.deleteAttachment(attachmentId);
    return { success: true, message: 'Attachment deleted successfully' };
  }

  async getActivityTimeline(organizationId: string, ticketId: string) {
    const ticket = await this.getTicketById(organizationId, ticketId);
    return ticket.activities;
  }

  async getDashboardStats(organizationId: string, currentUserId: string) {
    return this.ticketRepository.getDashboardStats(organizationId, currentUserId);
  }
}
