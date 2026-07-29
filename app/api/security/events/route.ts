import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { prisma } from '@/src/config/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    const events = await prisma.anomalyAlert.findMany({
      where: auth.organizationId ? { organizationId: auth.organizationId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(createSuccessResponse(events, 'Security events retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
