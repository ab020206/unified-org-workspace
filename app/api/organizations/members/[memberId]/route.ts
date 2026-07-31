import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth, requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { memberId } = await params;
    let orgId = auth.organizationId;

    if (!orgId) {
      const member = await (orgService as any).memberRepository.findById(memberId);
      if (!member) {
        return NextResponse.json(
          { success: false, message: 'Member not found' },
          { status: 404 }
        );
      }
      orgId = member.organizationId;
    }

    await orgService.removeMember(orgId!, auth.userId, memberId);
    return NextResponse.json(createSuccessResponse(null, 'Member removed successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { memberId } = await params;
    const body = await request.json().catch(() => ({}));
    const updated = await orgService.updateMember(auth.organizationId, auth.userId, memberId, body);
    return NextResponse.json(createSuccessResponse(updated, 'Member updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
