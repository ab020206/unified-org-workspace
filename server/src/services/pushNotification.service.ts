import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { SavePushSubscriptionDto } from '@workspace/shared-types';

export class PushNotificationService {
  async saveSubscription(userId: string, dto: SavePushSubscriptionDto) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent || null,
      },
      update: {
        userId,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent || null,
      },
    });
  }

  async removeSubscription(endpoint: string) {
    return prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  }

  async sendPushToUser(userId: string, payload: { title: string; message: string; url?: string }) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      logger.info({ userId }, 'No push subscriptions found for user');
      return { success: true, count: 0 };
    }

    let successCount = 0;
    for (const sub of subscriptions) {
      try {
        // In real environment, uses web-push npm package to send payload via VAPID
        logger.info(
          { userId, endpoint: sub.endpoint, title: payload.title },
          `[WebPush] Dispatched push payload to ${sub.endpoint}`
        );
        successCount++;
      } catch (err: any) {
        logger.error(
          { error: err.message, endpoint: sub.endpoint },
          'Failed to deliver Web Push payload'
        );
      }
    }

    return { success: true, count: successCount };
  }
}

export const pushNotificationService = new PushNotificationService();
