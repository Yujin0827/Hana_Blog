import { prisma } from './prisma';

/** 전체 게시글 + 검색 */
export async function getPosts(search?: string) {
  return prisma.post.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      Folder: true,
      Comment: true,
      PostLike: true,
    },
  });
}

/** 카테고리별 게시글 + 검색 */
export async function getPostsByCategory(category: string, search?: string) {
  return prisma.post.findMany({
    where: {
      Folder: {
        title: category,
      },
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      Folder: true,
      Comment: true,
      PostLike: true,
    },
  });
}

/** 게시글 하나 */
export async function getPostById(postId: number) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      User: true,
      Folder: true,
      PostLike: true,
      Comment: {
        where: { parentid: null },
        orderBy: { createdAt: 'asc' },
        include: {
          User: true,
          other_Comment: {
            orderBy: { createdAt: 'asc' },
            include: { User: true },
          },
        },
      },
    },
  });
}

export async function getRecentPosts(limit = 4) {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      Folder: true,
    },
  });
}
