import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/src/services/audit.service';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { Role } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    const isSuperAdmin = auth.role === Role.SUPER_ADMIN;

    const log = await auditService.getLogById(id, auth.organizationId, isSuperAdmin);
    if (!log) {
      return NextResponse.json(
        { success: false, message: 'Audit record not found', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(log, 'Audit record retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
