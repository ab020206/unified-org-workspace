import { NextRequest, NextResponse } from 'next/server';
import { PullRequestService } from '@/src/services/pullRequest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const prService = new PullRequestService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const stats = await prService.getDashboardStats(auth.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(stats, 'PR Dashboard stats retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
