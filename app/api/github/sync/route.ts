import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/src/services/github.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const githubService = new GitHubService();

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const body = await request.json().catch(() => ({}));
    const { repositoryId } = body;

    const result = await githubService.syncPullRequests(auth.organizationId, repositoryId, auth.userId);
    return NextResponse.json(createSuccessResponse(result, 'GitHub pull requests synced successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
