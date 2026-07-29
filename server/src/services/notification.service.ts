import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationType, NotificationListQueryDto } from '@workspace/shared-types';
import { auditService } from './audit.service';
import { UserRepository } from '../repositories/user.repository';

export class NotificationService {
  private notifRepo: NotificationRepository;
  private userRepo: UserRepository;

  constructor() {
    this.notifRepo = new NotificationRepository();
    this.userRepo = new UserRepository();
  }

  async sendNotification(data: {
    userId: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    const notif = await this.notifRepo.createNotification(data);
    return notif;
  }

  async getNotifications(organizationId: string, userId: string, query: NotificationListQueryDto) {
    return this.notifRepo.findNotifications(organizationId, userId, query);
  }

  async markAsRead(organizationId: string, userId: string, notificationId: string) {
    await this.notifRepo.markAsRead(notificationId, userId);

    const user = await this.userRepo.findById(userId);
    await auditService.log({
      organizationId,
      actorId: userId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: 'NOTIFICATIONS',
      action: 'NOTIFICATION_READ',
      entityType: 'NOTIFICATION',
      entityId: notificationId,
    });

    return { success: true, message: 'Notification marked as read' };
  }

  async markAllAsRead(organizationId: string, userId: string) {
    await this.notifRepo.markAllAsRead(organizationId, userId);

    const user = await this.userRepo.findById(userId);
    await auditService.log({
      organizationId,
      actorId: userId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'MEMBER',
      module: 'NOTIFICATIONS',
      action: 'NOTIFICATION_READ_ALL',
      entityType: 'NOTIFICATION',
      entityId: 'ALL',
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  async deleteNotification(organizationId: string, userId: string, notificationId: string) {
    await this.notifRepo.deleteNotification(notificationId, userId);
    return { success: true, message: 'Notification deleted successfully' };
  }
}

export const notificationService = new NotificationService();
