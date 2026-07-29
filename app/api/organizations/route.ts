import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { createOrganizationSchema } from '@/src/validators/organization.validator';

const orgService = new OrganizationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const orgs = await orgService.getUserOrganizations(auth.userId);
    return NextResponse.json(createSuccessResponse(orgs, 'User organizations retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const body = await request.json();
    const validated = createOrganizationSchema.parse(body);

    const org = await orgService.createOrganization(auth.userId, validated);
    return NextResponse.json(createSuccessResponse(org, 'Organization created successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
