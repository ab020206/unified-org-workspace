import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;

    await orgService.cancelInvitation(auth.organizationId, auth.userId, id);
    return NextResponse.json(createSuccessResponse(null, 'Invitation cancelled successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
