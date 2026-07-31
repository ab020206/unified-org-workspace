import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    const members = await orgService.listMembers(id, auth.userId);
    return NextResponse.json(createSuccessResponse(members, 'Members retrieved successfully'));
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
    const body = await request.json().catch(() => ({}));
    const result = await orgService.createMemberDirect(id, auth.userId, body);
    return NextResponse.json(createSuccessResponse(result, 'Member added successfully'), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
