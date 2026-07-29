import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/src/services/github.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const githubService = new GitHubService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const repos = await githubService.listRepositories(auth.organizationId);
    return NextResponse.json(createSuccessResponse(repos));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const body = await request.json();
    const integration = await githubService.connectRepository(auth.organizationId, auth.userId, body);
    return NextResponse.json(createSuccessResponse(integration, 'GitHub repository connected successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
