import { NextRequest, NextResponse } from 'next/server';
import { SessionRepository } from '@/src/repositories/session.repository';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { SecuritySessionPayload } from '@workspace/shared-types';

const sessionRepo = new SessionRepository();

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const sessions = await sessionRepo.listUserSessions(auth.userId);

    const formatted: SecuritySessionPayload[] = sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      lastActivity: s.lastActivity.toISOString(),
      expiry: s.expiry.toISOString(),
      createdAt: s.createdAt.toISOString(),
      isCurrent: false,
    }));

    return NextResponse.json(createSuccessResponse(formatted, 'Active sessions retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
