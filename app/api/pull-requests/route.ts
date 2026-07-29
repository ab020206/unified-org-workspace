import { NextRequest, NextResponse } from 'next/server';
import { PullRequestService } from '@/src/services/pullRequest.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { createPRSchema, prListQuerySchema } from '@/src/validators/pullRequest.validator';

const prService = new PullRequestService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = prListQuerySchema.parse(searchParams);

    const result = await prService.getPullRequests(auth.organizationId, query);
    return NextResponse.json(createSuccessResponse(result, 'Pull Requests retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const body = await request.json();
    const validated = createPRSchema.parse(body);

    const pr = await prService.createPullRequest(auth.organizationId, auth.userId, validated as any);
    return NextResponse.json(createSuccessResponse(pr, 'Pull Request created successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
