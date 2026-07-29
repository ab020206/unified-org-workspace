import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/src/services/audit.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { auditListQuerySchema } from '@/src/validators/audit.validator';
import { Role } from '@workspace/shared-types';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = auditListQuerySchema.parse(searchParams);

    const isSuperAdmin = auth.role === Role.SUPER_ADMIN;
    const orgId = isSuperAdmin ? null : auth.organizationId || null;

    const result = await auditService.getLogs(query, orgId, isSuperAdmin);
    return NextResponse.json(createSuccessResponse(result, 'Audit logs retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
