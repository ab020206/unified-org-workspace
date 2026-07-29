import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { loginSchema } from '@/src/validators/auth.validator';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);
    const meta = {
      browser: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || undefined,
    };

    const result = await authService.login(validated, meta);

    const response = NextResponse.json(createSuccessResponse(result, 'Login successful'));
    response.cookies.set('refreshToken', result.tokens.refreshToken, {
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
