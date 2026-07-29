import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const orgService = new OrganizationService();

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const body = await request.json();

    const org = await orgService.onboardOrganization(auth.userId, body);
    return NextResponse.json(createSuccessResponse(org, 'Organization onboarded successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
