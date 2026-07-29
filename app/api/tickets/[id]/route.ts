import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/src/services/ticket.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { updateTicketSchema } from '@/src/validators/ticket.validator';

const ticketService = new TicketService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const ticket = await ticketService.getTicketById(auth.organizationId, id);
    return NextResponse.json(createSuccessResponse(ticket, 'Ticket retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateTicketSchema.parse(body);

    const ticket = await ticketService.updateTicket(auth.organizationId, id, auth.userId, validated as any);
    return NextResponse.json(createSuccessResponse(ticket, 'Ticket updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    await ticketService.deleteTicket(auth.organizationId, id, auth.userId);
    return NextResponse.json(createSuccessResponse(null, 'Ticket deleted successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
