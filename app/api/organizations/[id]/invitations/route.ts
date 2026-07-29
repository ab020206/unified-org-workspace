import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { inviteMemberSchema } from '@/src/validators/organization.validator';

const orgService = new OrganizationService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    const invitations = await orgService.listInvitations(id);
    return NextResponse.json(createSuccessResponse(invitations, 'Invitations retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validated = inviteMemberSchema.parse(body);

    const invite = await orgService.inviteMember(id, auth.userId, validated as any);
    return NextResponse.json(createSuccessResponse(invite, 'Invitation sent successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
