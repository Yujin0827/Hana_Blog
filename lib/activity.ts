import { prisma } from './prisma';

export type ActivityMap = Record<string, number>;
export type ActivityByYear = Record<number, ActivityMap>;

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getGrassActivity(): Promise<ActivityByYear> {
  const posts = await prisma.post.findMany({
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  const result: ActivityByYear = {};

  for (const post of posts) {
    const dates = [post.createdAt, post.updatedAt];

    for (const date of dates) {
      const year = date.getFullYear();
      const day = toYmd(date);

      if (!result[year]) result[year] = {};
      result[year][day] = (result[year][day] ?? 0) + 1;
    }
  }

  return result;
}
