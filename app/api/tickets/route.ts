import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/src/services/ticket.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { createTicketSchema, ticketListQuerySchema } from '@/src/validators/ticket.validator';

const ticketService = new TicketService();

export async function GET(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = ticketListQuerySchema.parse(searchParams);

    const result = await ticketService.getTickets(auth.organizationId, query);
    return NextResponse.json(createSuccessResponse(result, 'Tickets retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireOrgAuth(request);
    const body = await request.json();
    const validated = createTicketSchema.parse(body);

    const ticket = await ticketService.createTicket(auth.organizationId, auth.userId, validated as any);
    return NextResponse.json(createSuccessResponse(ticket, 'Ticket created successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
