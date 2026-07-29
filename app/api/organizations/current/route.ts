import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    let orgId = auth.organizationId;

    if (!orgId) {
      const orgs = await orgService.getUserOrganizations(auth.userId);
      if (orgs.length > 0) {
        orgId = orgs[0].id;
      }
    }

    if (!orgId) {
      return NextResponse.json(createSuccessResponse(null, 'No active organization found'));
    }

    const org = await orgService.getOrganizationDetails(orgId, auth.userId);
    return NextResponse.json(createSuccessResponse(org, 'Current organization context retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}
