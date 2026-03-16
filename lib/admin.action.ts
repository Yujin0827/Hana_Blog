import { prisma } from '@/lib/prisma';

export async function getUsers(search?: string) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [{ email: { contains: search } }, { name: { contains: search } }],
        }
      : undefined,
    orderBy: { id: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      isadmin: true,
    },
  });
}
