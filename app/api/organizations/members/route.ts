import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const members = await orgService.listMembers(auth.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(members, 'Organization members retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
