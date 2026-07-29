import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/src/services/ticket.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const ticketService = new TicketService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const stats = await ticketService.getDashboardStats(auth.organizationId, auth.userId);
    return NextResponse.json(createSuccessResponse(stats, 'Dashboard stats retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
