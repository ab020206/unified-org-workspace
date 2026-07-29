import { NextRequest, NextResponse } from 'next/server';
import { auditAnalyticsService } from '@/src/services/auditAnalytics.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { Role } from '@workspace/shared-types';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

    const isSuperAdmin = auth.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : auth.organizationId || null;

    const summary = await auditAnalyticsService.getAnalyticsSummary(
      searchParams as any,
      scopedOrgId,
      auth.role
    );
    return NextResponse.json(createSuccessResponse(summary, 'Audit analytics retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
