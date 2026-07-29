import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;

    const resend = await orgService.resendInvitation(auth.organizationId, auth.userId, id);
    return NextResponse.json(createSuccessResponse(resend, 'Invitation resent successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
