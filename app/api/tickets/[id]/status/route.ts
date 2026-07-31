import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/src/services/ticket.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const ticketService = new TicketService();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const ticket = await ticketService.updateTicketStatus(
      auth.organizationId,
      id,
      auth.userId,
      body.status
    );
    return NextResponse.json(createSuccessResponse(ticket, 'Ticket status updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
