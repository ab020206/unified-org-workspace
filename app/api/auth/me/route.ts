import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { getAuthContext } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request);
    const user = await authService.getMe(auth.userId);
    return NextResponse.json(createSuccessResponse(user, 'Current user profile retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}
