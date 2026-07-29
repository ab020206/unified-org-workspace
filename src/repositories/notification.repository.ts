import { prisma } from '../config/prisma';
import { NotificationType, NotificationListQueryDto } from '@workspace/shared-types';

export class NotificationRepository {
  async createNotification(data: {
    userId: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        type: data.type,
        title: data.title,
        message: data.message,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
      },
    });
  }

  async findNotifications(organizationId: string, userId: string, query: NotificationListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      userId,
    };

    if (query.unreadOnly) {
      where.isRead = false;
    }
    if (query.type) {
      where.type = query.type;
    }

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { organizationId, userId, isRead: false } }),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(organizationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { organizationId, userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}
