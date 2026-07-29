import { NextRequest, NextResponse } from 'next/server';
import { DigestService } from '@/src/services/digest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const digestService = new DigestService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const history = await digestService.getDigestHistory(
      auth.organizationId,
      auth.userId,
      page,
      limit
    );
    return NextResponse.json(createSuccessResponse(history, 'Digest history retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}
