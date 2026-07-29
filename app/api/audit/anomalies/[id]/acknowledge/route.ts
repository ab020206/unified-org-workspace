import { NextRequest, NextResponse } from 'next/server';
import { auditAnalyticsService } from '@/src/services/auditAnalytics.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { Role } from '@workspace/shared-types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    const isSuperAdmin = auth.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : auth.organizationId || null;

    const updated = await auditAnalyticsService.acknowledgeAnomaly(id, auth.userId, scopedOrgId);
    return NextResponse.json(createSuccessResponse(updated, 'Anomaly alert acknowledged'));
  } catch (error) {
    return handleApiError(error);
  }
}
