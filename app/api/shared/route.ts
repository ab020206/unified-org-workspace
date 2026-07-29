import { NextRequest, NextResponse } from 'next/server';
import { CollaborationService } from '@/src/services/collaboration.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const collabService = new CollaborationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const dashboard = await collabService.getSharedDashboard(auth.organizationId);
    return NextResponse.json(createSuccessResponse(dashboard.incomingShares, 'Received shared resources retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
