import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      createSuccessResponse(
        { message: 'If an account exists with this email, password reset instructions have been sent.' },
        'Password reset link requested'
      )
    );
  } catch (error) {
    return handleApiError(error);
  }
}
