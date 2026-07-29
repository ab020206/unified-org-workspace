import { NextRequest, NextResponse } from 'next/server';
import { PullRequestService } from '@/src/services/pullRequest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { updatePRSchema } from '@/src/validators/pullRequest.validator';

const prService = new PullRequestService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const pr = await prService.getPullRequestById(auth.organizationId, id);
    return NextResponse.json(createSuccessResponse(pr, 'Pull Request retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updatePRSchema.parse(body);

    const pr = await prService.updatePullRequest(auth.organizationId, id, auth.userId, validated as any);
    return NextResponse.json(createSuccessResponse(pr, 'Pull Request updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    await prService.deletePullRequest(auth.organizationId, id, auth.userId);
    return NextResponse.json(createSuccessResponse(null, 'Pull Request deleted successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
