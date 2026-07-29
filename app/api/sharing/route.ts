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
    return NextResponse.json(createSuccessResponse(dashboard.outgoingShares, 'Owned shared resources retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const body = await request.json();

    const share = await collabService.shareResource(auth.organizationId, auth.userId, body);

    return NextResponse.json(createSuccessResponse(share, 'Resource shared successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
