import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const body = await request.json();

    const org = await orgService.getOrganizationDetails(body.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(org, 'Active organization switched successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
