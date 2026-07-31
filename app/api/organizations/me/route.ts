import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const cookieOrgId = request.cookies.get('active_org_id')?.value;
    const currentOrgId = request.headers.get('x-organization-id') || cookieOrgId || auth.organizationId;

    const data = await orgService.getOrganizationsMe(auth.userId, currentOrgId);
    return NextResponse.json(createSuccessResponse(data, 'User organization context retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}
