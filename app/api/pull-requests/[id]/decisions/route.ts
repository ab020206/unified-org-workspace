import { NextRequest, NextResponse } from 'next/server';
import { PullRequestService } from '@/src/services/pullRequest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const prService = new PullRequestService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const body = await request.json();

    const decision = await prService.recordDecision(
      auth.organizationId,
      id,
      auth.userId,
      body.decision,
      body.comment
    );
    return NextResponse.json(createSuccessResponse(decision, 'Review decision submitted successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
