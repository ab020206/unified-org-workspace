import { NextRequest, NextResponse } from 'next/server';
import { featureFlagService } from '@/src/services/featureFlag.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const result = await featureFlagService.getFeatureFlags(auth.organizationId);
    return NextResponse.json(createSuccessResponse(result, 'Feature flags retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
