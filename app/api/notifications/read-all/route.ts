import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/src/services/notification.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const notifService = new NotificationService();

export async function PUT(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const result = await notifService.markAllAsRead(auth.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(result, 'All notifications marked as read'));
  } catch (error) {
    return handleApiError(error);
  }
}
