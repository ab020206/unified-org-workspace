import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id, memberId } = await params;

    const result = await orgService.resetMemberPassword(id, auth.userId, memberId);
    return NextResponse.json(createSuccessResponse(result, 'Member password reset successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
