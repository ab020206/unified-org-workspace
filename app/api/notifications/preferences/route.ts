import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/src/services/notification.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const notifService = new NotificationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const prefs = await notifService.getPreferences(auth.userId);
    return NextResponse.json(createSuccessResponse(prefs, 'Notification preferences retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const body = await request.json();
    const prefs = await notifService.updatePreferences(auth.userId, body);
    return NextResponse.json(createSuccessResponse(prefs, 'Notification preferences updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
