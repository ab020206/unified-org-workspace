import { Response } from 'express';
import { AppRequest } from '../types/index';
import { NotificationService } from '../services/notification.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import { notificationListQuerySchema } from '../validators/notification.validator';

const notifService = new NotificationService();

export class NotificationController {
  static getNotifications = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const query = notificationListQuerySchema.parse(req.query);

    const notifications = await notifService.getNotifications(orgId, userId, query);
    res
      .status(200)
      .json(
        createSuccessResponse(
          notifications,
          'Notifications retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static markAsRead = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await notifService.markAsRead(orgId, userId, id);
    res
      .status(200)
      .json(createSuccessResponse(result, 'Notification marked as read', req.requestId || 'N/A'));
  };

  static markAllAsRead = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;

    const result = await notifService.markAllAsRead(orgId, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'All notifications marked as read', req.requestId || 'N/A')
      );
  };

  static deleteNotification = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await notifService.deleteNotification(orgId, userId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Notification deleted successfully', req.requestId || 'N/A')
      );
  };

  static getPreferences = async (req: AppRequest, res: Response) => {
    const userId = req.user!.id;
    const pref = await notifService.getPreferences(userId);
    res
      .status(200)
      .json(createSuccessResponse(pref, 'Preferences retrieved', req.requestId || 'N/A'));
  };

  static updatePreferences = async (req: AppRequest, res: Response) => {
    const userId = req.user!.id;
    const pref = await notifService.updatePreferences(userId, req.body);
    res
      .status(200)
      .json(
        createSuccessResponse(pref, 'Preferences updated successfully', req.requestId || 'N/A')
      );
  };

  static subscribePush = async (req: AppRequest, res: Response) => {
    const userId = req.user!.id;
    const sub = await notifService.savePushSubscription(userId, req.body);
    res
      .status(200)
      .json(
        createSuccessResponse(sub, 'Push notification subscription saved', req.requestId || 'N/A')
      );
  };

  static unsubscribePush = async (req: AppRequest, res: Response) => {
    const { endpoint } = req.body;
    await notifService.removePushSubscription(endpoint);
    res
      .status(200)
      .json(
        createSuccessResponse(
          { success: true },
          'Unsubscribed from push notifications',
          req.requestId || 'N/A'
        )
      );
  };
}
