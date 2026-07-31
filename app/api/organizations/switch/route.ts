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
    const targetOrgId = body.organizationId || body.orgId;

    if (!targetOrgId) {
      return NextResponse.json({ success: false, message: 'organizationId is required' }, { status: 400 });
    }

    const previousOrgId = request.headers.get('x-organization-id') || auth.organizationId;
    const result = await orgService.switchOrganizationContext(auth.userId, targetOrgId, previousOrgId);

    const response = NextResponse.json(
      createSuccessResponse(
        {
          activeOrganization: result.activeOrganization,
          role: result.role,
          token: result.token,
          accessToken: result.token,
          isPlatformView: result.isPlatformView,
        },
        'Switched active organization context successfully'
      )
    );

    if (targetOrgId === 'platform' || result.isPlatformView) {
      response.cookies.delete('active_org_id');
    } else if (result.activeOrganization?.id) {
      response.cookies.set('active_org_id', result.activeOrganization.id, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
