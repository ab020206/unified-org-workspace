import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { handleApiError, ValidationError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieToken = request.cookies.get('refreshToken')?.value;
    const refreshToken = body.refreshToken || cookieToken;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const result = await authService.refresh(refreshToken);

    const response = NextResponse.json(createSuccessResponse(result, 'Token refreshed successfully'));
    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
