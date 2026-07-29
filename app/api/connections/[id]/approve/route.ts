import { NextRequest, NextResponse } from 'next/server';
import { CollaborationService } from '@/src/services/collaboration.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const collabService = new CollaborationService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;

    const connection = await collabService.acceptConnection(id, auth.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(connection, 'Connection approved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
