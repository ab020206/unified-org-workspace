import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const body = await request.json().catch(() => ({}));
    const orgId = body.organizationId || auth.organizationId;
    const result = await orgService.createMemberDirect(orgId, auth.userId, body);
    return NextResponse.json(createSuccessResponse(result, 'Member created successfully'), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
