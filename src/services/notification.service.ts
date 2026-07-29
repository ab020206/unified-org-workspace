import { NotificationRepository } from '../repositories/notification.repository';
import {
  NotificationType,
  NotificationListQueryDto,
  UpdateNotificationPreferenceDto,
  SavePushSubscriptionDto,
} from '@workspace/shared-types';
import { auditService } from './audit.service';
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../config/prisma';
import { getEmailProvider } from './email/email.provider';
import { renderInstantEventEmailHtml, renderDigestEmailHtml } from './email/email.templates';
import { pushNotificationService } from './pushNotification.service';
import { logger } from '../utils/logger';

export class NotificationService {
  private notifRepo: NotificationRepository;
  private userRepo: UserRepository;

  constructor() {
    this.notifRepo = new NotificationRepository();
    this.userRepo = new UserRepository();
  }

  async getPreferences(userId: string) {
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: {
          userId,
          emailDigestFrequency: 'DAILY',
          emailInstantEvents: true,
          pushEnabled: false,
          eventPreferences: {},
        },
      });
    }

    return pref;
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferenceDto) {
    const existing = await this.getPreferences(userId);

    const updateData: any = {};
    if (dto.emailDigestFrequency) updateData.emailDigestFrequency = dto.emailDigestFrequency;
    if (dto.emailInstantEvents !== undefined)
      updateData.emailInstantEvents = dto.emailInstantEvents;
    if (dto.pushEnabled !== undefined) updateData.pushEnabled = dto.pushEnabled;
    if (dto.eventPreferences) updateData.eventPreferences = dto.eventPreferences;

    return prisma.notificationPreference.update({
      where: { userId: existing.userId },
      data: updateData,
    });
  }

  async savePushSubscription(userId: string, dto: SavePushSubscriptionDto) {
    await this.updatePreferences(userId, { pushEnabled: true });
    return pushNotificationService.saveSubscription(userId, dto);
  }

  async removePushSubscription(endpoint: string) {
    return pushNotificationService.removeSubscription(endpoint);
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
    // 1. In-App Notification (Always stored)
    const inAppNotif = await this.notifRepo.createNotification({
      ...data,
      channel: 'IN_APP',
      deliveryStatus: 'DELIVERED',
    } as any);

    // 2. Fetch User & Preferences for Email / Push Routing
    const [user, pref] = await Promise.all([
      this.userRepo.findById(data.userId),
      this.getPreferences(data.userId),
    ]);

    if (!user) return inAppNotif;

    // 3. Multi-Channel Email Dispatch
    if (pref.emailInstantEvents && user.email) {
      const emailProvider = getEmailProvider();
      const html = renderInstantEventEmailHtml(data.title, data.message, user.firstName);

      emailProvider
        .sendEmail({
          to: user.email,
          subject: data.title,
          html,
        })
        .catch((err) => {
          logger.error(
            { error: err.message, userId: data.userId },
            'Email notification dispatch failed'
          );
        });
    }

    // 4. Multi-Channel Web Push Dispatch
    if (pref.pushEnabled) {
      pushNotificationService
        .sendPushToUser(data.userId, {
          title: data.title,
          message: data.message,
        })
        .catch((err) => {
          logger.error(
            { error: err.message, userId: data.userId },
            'Push notification dispatch failed'
          );
        });
    }

    return inAppNotif;
  }

  async deliverDigestEmail(userId: string, title: string, summary: string) {
    const user = await this.userRepo.findById(userId);
    const pref = await this.getPreferences(userId);

    if (!user || pref.emailDigestFrequency === 'NEVER' || !user.email) {
      return false;
    }

    const emailProvider = getEmailProvider();
    const html = renderDigestEmailHtml(title, summary, user.firstName);

    const result = await emailProvider.sendEmail({
      to: user.email,
      subject: `📊 ${title}`,
      html,
    });

    if (pref.pushEnabled) {
      await pushNotificationService.sendPushToUser(userId, {
        title: `📊 ${title}`,
        message: 'Your Executive AI Activity Briefing is now ready.',
      });
    }

    return result.success;
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
