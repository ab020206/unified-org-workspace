import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/src/services/aiInsights.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { Role } from '@workspace/shared-types';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const isSuperAdmin = auth.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : auth.organizationId || null;

    const insights = await aiInsightsService.generateExecutiveInsights(scopedOrgId, auth.role);
    return NextResponse.json(createSuccessResponse(insights, 'AI executive insights generated'));
  } catch (error) {
    return handleApiError(error);
  }
}
