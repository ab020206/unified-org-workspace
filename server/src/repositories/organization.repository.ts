import { prisma } from '../config/prisma';
import { Organization, Prisma } from '@prisma/client';

export class OrganizationRepository {
  public async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } });
  }

  public async findBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { slug } });
  }

  public async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return prisma.organization.create({ data });
  }

  public async update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({ where: { id }, data });
  }

  public async findUserOrganizations(userId: string): Promise<Organization[]> {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId, isActive: true },
      include: { organization: true },
      orderBy: { joinedAt: 'asc' },
    });
    return memberships.map((m) => m.organization);
  }
}
