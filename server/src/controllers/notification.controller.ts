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
}
