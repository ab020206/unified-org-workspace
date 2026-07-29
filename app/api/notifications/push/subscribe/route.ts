import { NextRequest, NextResponse } from 'next/server';
import { PushNotificationService } from '@/src/services/pushNotification.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const pushService = new PushNotificationService();

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const body = await request.json();
    const sub = await pushService.saveSubscription(auth.userId, body);
    return NextResponse.json(createSuccessResponse(sub, 'Push subscription saved successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
