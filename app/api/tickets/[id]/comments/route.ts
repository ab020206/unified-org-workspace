import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/src/services/ticket.service';
import { requireOrgAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { createCommentSchema } from '@/src/validators/ticket.validator';

const ticketService = new TicketService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const ticket = await ticketService.getTicketById(auth.organizationId, id);
    return NextResponse.json(createSuccessResponse(ticket.comments, 'Comments retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireOrgAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validated = createCommentSchema.parse(body);

    const comment = await ticketService.addComment(auth.organizationId, id, auth.userId, validated.message);
    return NextResponse.json(createSuccessResponse(comment, 'Comment added successfully'), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
