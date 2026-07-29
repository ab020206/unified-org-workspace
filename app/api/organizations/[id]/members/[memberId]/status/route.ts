import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id, memberId } = await params;
    const body = await request.json();

    const updated = await orgService.updateMember(id, auth.userId, memberId, { isActive: body.isActive });
    return NextResponse.json(createSuccessResponse(updated, 'Member status updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
