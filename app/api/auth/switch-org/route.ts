import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { getAuthContext } from '@/src/lib/apiAuth';
import { handleApiError, ValidationError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContext(request);
    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      throw new ValidationError('organizationId is required');
    }

    const org = await orgService.getOrganizationDetails(organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(org, 'Switched active organization context'));
  } catch (error) {
    return handleApiError(error);
  }
}
