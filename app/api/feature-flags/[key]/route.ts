import { NextRequest, NextResponse } from 'next/server';
import { featureFlagService } from '@/src/services/featureFlag.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { key } = await params;
    const body = await request.json();
    const { enabled, organizationId } = body;

    const targetOrgId = organizationId !== undefined ? organizationId : auth.organizationId;
    const actorContext = {
      actorId: auth.userId,
      actorEmail: auth.email,
      actorRole: auth.role,
    };

    const updated = await featureFlagService.toggleFlag(key, enabled, targetOrgId, actorContext);
    return NextResponse.json(createSuccessResponse(updated, `Feature flag '${key}' updated successfully`));
  } catch (error) {
    return handleApiError(error);
  }
}
