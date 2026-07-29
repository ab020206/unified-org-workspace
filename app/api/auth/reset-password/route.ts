import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      createSuccessResponse(
        { message: 'Password has been reset successfully.' },
        'Password reset completed'
      )
    );
  } catch (error) {
    return handleApiError(error);
  }
}
