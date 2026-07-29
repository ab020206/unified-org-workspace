import { NextRequest, NextResponse } from 'next/server';
import { auditAnalyticsService } from '@/src/services/auditAnalytics.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { Role } from '@workspace/shared-types';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const isSuperAdmin = auth.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : auth.organizationId || null;

    const alerts = await auditAnalyticsService.runAnomalyDetection(scopedOrgId);
    return NextResponse.json(createSuccessResponse(alerts, 'Anomaly alerts retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}
