import { prisma } from '../config/prisma';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketListQueryDto,
} from '@workspace/shared-types';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
};

export class TicketRepository {
  async createTicket(data: {
    organizationId: string;
    title: string;
    description: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    createdBy: string;
    assignedTo?: string | null;
  }) {
    return prisma.ticket.create({
      data: {
        organizationId: data.organizationId,
        title: data.title,
        description: data.description,
        category: data.category || TicketCategory.GENERAL,
        priority: data.priority || TicketPriority.MEDIUM,
        createdBy: data.createdBy,
        assignedTo: data.assignedTo || null,
        status: TicketStatus.OPEN,
      },
      include: {
        creator: { select: userSelect },
        assignee: { select: userSelect },
      },
    });
  }

  async findTicketById(organizationId: string, ticketId: string) {
    return prisma.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId,
      },
      include: {
        creator: { select: userSelect },
        assignee: { select: userSelect },
        comments: {
          include: { user: { select: userSelect } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          include: { uploader: { select: userSelect } },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: { actor: { select: userSelect } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findTickets(organizationId: string, query: TicketListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    // Search by Ticket Number, Title, Description
    if (query.search) {
      const isNum = !isNaN(Number(query.search));
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        ...(isNum ? [{ ticketNumber: Number(query.search) }] : []),
      ];
    }

    // Filter by Status
    if (query.status) {
      where.status = Array.isArray(query.status) ? { in: query.status } : query.status;
    }

    // Filter by Priority
    if (query.priority) {
      where.priority = Array.isArray(query.priority) ? { in: query.priority } : query.priority;
    }

    // Filter by Category
    if (query.category) {
      where.category = Array.isArray(query.category) ? { in: query.category } : query.category;
    }

    // Filter by Assigned To
    if (query.assignedTo) {
      where.assignedTo = query.assignedTo === 'unassigned' ? null : query.assignedTo;
    }

    // Filter by Created By
    if (query.createdBy) {
      where.createdBy = query.createdBy;
    }

    // Date Range Filter
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: { select: userSelect },
          assignee: { select: userSelect },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateTicket(organizationId: string, ticketId: string, data: any) {
    const existing = await prisma.ticket.findFirst({
      where: { id: ticketId, organizationId },
    });
    if (!existing) return null;

    return prisma.ticket.update({
      where: { id: ticketId },
      data,
      include: {
        creator: { select: userSelect },
        assignee: { select: userSelect },
      },
    });
  }

  async deleteTicket(organizationId: string, ticketId: string) {
    const existing = await prisma.ticket.findFirst({
      where: { id: ticketId, organizationId },
    });
    if (!existing) return false;

    await prisma.ticket.delete({ where: { id: ticketId } });
    return true;
  }

  async createComment(ticketId: string, userId: string, message: string) {
    return prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        message,
      },
      include: {
        user: { select: userSelect },
      },
    });
  }

  async findCommentById(commentId: string) {
    return prisma.ticketComment.findUnique({
      where: { id: commentId },
      include: {
        ticket: { select: { organizationId: true } },
        user: { select: userSelect },
      },
    });
  }

  async updateComment(commentId: string, message: string) {
    return prisma.ticketComment.update({
      where: { id: commentId },
      data: { message },
      include: {
        user: { select: userSelect },
      },
    });
  }

  async deleteComment(commentId: string) {
    await prisma.ticketComment.delete({ where: { id: commentId } });
    return true;
  }

  async createAttachment(data: {
    ticketId: string;
    uploadedBy: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
  }) {
    return prisma.ticketAttachment.create({
      data,
      include: {
        uploader: { select: userSelect },
      },
    });
  }

  async findAttachmentById(attachmentId: string) {
    return prisma.ticketAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        ticket: { select: { organizationId: true } },
        uploader: { select: userSelect },
      },
    });
  }

  async deleteAttachment(attachmentId: string) {
    await prisma.ticketAttachment.delete({ where: { id: attachmentId } });
    return true;
  }

  async createActivity(data: {
    ticketId: string;
    actorId: string;
    action: string;
    oldValue?: string | null;
    newValue?: string | null;
  }) {
    return prisma.ticketActivity.create({
      data: {
        ticketId: data.ticketId,
        actorId: data.actorId,
        action: data.action,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
      },
      include: {
        actor: { select: userSelect },
      },
    });
  }

  async getDashboardStats(organizationId: string, currentUserId: string) {
    const [totalTickets, openTickets, assignedToMeTickets, recentlyUpdatedTickets] =
      await Promise.all([
        prisma.ticket.count({ where: { organizationId } }),
        prisma.ticket.count({
          where: {
            organizationId,
            status: {
              in: [
                TicketStatus.OPEN,
                TicketStatus.IN_PROGRESS,
                TicketStatus.WAITING_FOR_RESPONSE,
                TicketStatus.REOPENED,
              ],
            },
          },
        }),
        prisma.ticket.count({
          where: {
            organizationId,
            assignedTo: currentUserId,
            status: { notIn: [TicketStatus.CLOSED] },
          },
        }),
        prisma.ticket.findMany({
          where: { organizationId },
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: {
            creator: { select: userSelect },
            assignee: { select: userSelect },
          },
        }),
      ]);

    return {
      totalTickets,
      openTickets,
      assignedToMeTickets,
      recentlyUpdatedTickets,
    };
  }
}
