import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieToken = request.cookies.get('refreshToken')?.value;
    const refreshToken = body.refreshToken || cookieToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    const response = NextResponse.json(createSuccessResponse(null, 'Logged out successfully'));
    response.cookies.delete('refreshToken');
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
