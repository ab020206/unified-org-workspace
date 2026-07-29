import { NextRequest, NextResponse } from 'next/server';
import { CollaborationService } from '@/src/services/collaboration.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const collabService = new CollaborationService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const connections = await collabService.listConnections(auth.organizationId);
    return NextResponse.json(createSuccessResponse(connections, 'Organization connections retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const body = await request.json();

    const connection = await collabService.requestConnection(
      auth.organizationId,
      auth.userId,
      body.targetOrganizationId
    );
    return NextResponse.json(createSuccessResponse(connection, 'Connection requested successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
