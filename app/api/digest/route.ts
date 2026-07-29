import { NextRequest, NextResponse } from 'next/server';
import { DigestService } from '@/src/services/digest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const digestService = new DigestService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const digest = await digestService.getLatestDigest(auth.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(digest, 'Latest AI digest retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}
