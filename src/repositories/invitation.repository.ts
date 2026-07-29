import { prisma } from '../config/prisma';
import { Invitation, Role } from '@prisma/client';

export class InvitationRepository {
  public async createInvitation(
    organizationId: string,
    email: string,
    invitedBy: string,
    token: string,
    role: Role = Role.GUEST,
    expiry: Date
  ): Promise<Invitation> {
    return prisma.invitation.create({
      data: {
        organizationId,
        email: email.toLowerCase().trim(),
        invitedBy,
        token,
        role,
        expiry,
      },
    });
  }

  public async findByToken(token: string): Promise<Invitation | null> {
    return prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
        inviter: true,
      },
    });
  }

  public async markAccepted(id: string): Promise<void> {
    await prisma.invitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }

  public async listPendingInvitations(organizationId: string) {
    return prisma.invitation.findMany({
      where: { organizationId, acceptedAt: null },
      include: {
        inviter: {
          select: { firstName: true, lastName: true, email: true },
        },
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findById(id: string) {
    return prisma.invitation.findUnique({
      where: { id },
      include: { inviter: true, organization: true },
    });
  }

  public async updateExpiry(id: string, expiry: Date) {
    return prisma.invitation.update({
      where: { id },
      data: { expiry },
    });
  }

  public async deleteInvitation(id: string): Promise<void> {
    await prisma.invitation.delete({
      where: { id },
    });
  }
}
