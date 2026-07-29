import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { registerSchema } from '@/src/validators/auth.validator';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);
    const meta = {
      device: request.headers.get('user-agent') || undefined,
      browser: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || undefined,
    };

    const result = await authService.register(validated, meta);

    const response = NextResponse.json(
      createSuccessResponse(result, 'Registration successful'),
      { status: 201 }
    );
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
