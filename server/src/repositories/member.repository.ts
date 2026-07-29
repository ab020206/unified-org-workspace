import { prisma } from '../config/prisma';
import { OrganizationMember, Role } from '@prisma/client';

export class MemberRepository {
  public async findMembership(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMember | null> {
    return prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  public async addMember(
    organizationId: string,
    userId: string,
    role: Role = Role.GUEST
  ): Promise<OrganizationMember> {
    return prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
        isActive: true,
      },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  public async listMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  public async countMembers(organizationId: string): Promise<number> {
    return prisma.organizationMember.count({
      where: { organizationId, isActive: true },
    });
  }

  public async updateRole(id: string, role: Role) {
    return prisma.organizationMember.update({
      where: { id },
      data: { role },
      include: { user: true, organization: true },
    });
  }

  public async findById(id: string) {
    return prisma.organizationMember.findUnique({
      where: { id },
      include: { user: true, organization: true },
    });
  }

  public async updateStatus(id: string, isActive: boolean) {
    return prisma.organizationMember.update({
      where: { id },
      data: { isActive },
      include: { user: true, organization: true },
    });
  }

  public async removeMember(id: string) {
    return prisma.organizationMember.delete({
      where: { id },
    });
  }
}
