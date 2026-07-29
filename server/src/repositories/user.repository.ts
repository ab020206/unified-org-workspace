import { prisma } from '../config/prisma';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  }

  public async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase().trim(),
      },
    });
  }

  public async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
