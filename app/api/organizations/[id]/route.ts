import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@/src/services/organization.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { updateOrganizationSchema } from '@/src/validators/organization.validator';

const orgService = new OrganizationService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    const org = await orgService.getOrganizationDetails(id, auth.userId);
    return NextResponse.json(createSuccessResponse(org, 'Organization details retrieved'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateOrganizationSchema.parse(body);

    const updated = await orgService.updateOrganization(id, auth.userId, validated);
    return NextResponse.json(createSuccessResponse(updated, 'Organization updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
