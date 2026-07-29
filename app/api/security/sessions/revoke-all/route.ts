import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    await authService.logoutAll(auth.userId);
    return NextResponse.json(createSuccessResponse(null, 'Successfully logged out from all devices'));
  } catch (error) {
    return handleApiError(error);
  }
}
