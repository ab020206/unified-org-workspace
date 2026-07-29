import { NextRequest, NextResponse } from 'next/server';
import { PullRequestService } from '@/src/services/pullRequest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { ReviewDecisionType } from '@workspace/shared-types';

const prService = new PullRequestService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updated = await prService.recordDecision(
      auth.organizationId,
      id,
      auth.userId,
      ReviewDecisionType.REJECTED,
      body.comment
    );
    return NextResponse.json(createSuccessResponse(updated, 'Pull request rejected'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
