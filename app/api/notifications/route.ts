import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/src/services/notification.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { notificationListQuerySchema } from '@/src/validators/notification.validator';

const notifService = new NotificationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = notificationListQuerySchema.parse(searchParams);

    const notifications = await notifService.getNotifications(auth.organizationId, auth.userId, query);
    return NextResponse.json(createSuccessResponse(notifications, 'Notifications retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
