import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/src/services/notification.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const notifService = new NotificationService();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const result = await notifService.markAsRead(auth.organizationId, auth.userId, id);
    return NextResponse.json(createSuccessResponse(result, 'Notification marked as read'));
  } catch (error) {
    return handleApiError(error);
  }
}
