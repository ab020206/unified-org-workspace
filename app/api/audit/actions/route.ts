import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/src/services/audit.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const isSuperAdmin = auth.role === Role.SUPER_ADMIN;
    const actions = await auditService.getActions(auth.organizationId, isSuperAdmin);
    return NextResponse.json(createSuccessResponse(actions, 'Audit actions retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
