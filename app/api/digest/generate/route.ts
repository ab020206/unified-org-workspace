import { NextRequest, NextResponse } from 'next/server';
import { DigestService } from '@/src/services/digest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const digestService = new DigestService();

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const pending = await digestService.triggerManualDigestGeneration(auth.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(pending, 'Digest generation enqueued'), { status: 202 });
  } catch (error) {
    return handleApiError(error);
  }
}
