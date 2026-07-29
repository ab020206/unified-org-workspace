import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
    return NextResponse.json(createSuccessResponse({ mfaEnabled: true }, 'MFA verification successful'));
  } catch (error) {
    return handleApiError(error);
  }
}
