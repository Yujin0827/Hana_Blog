import { prisma } from '@/lib/prisma';

async function main() {
  // 기존 데이터 삭제
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.user.deleteMany();

  // Category Folder
  const folders = [
    { id: 1, title: 'javascript' },
    { id: 2, title: 'typescript' },
    { id: 3, title: 'react' },
    { id: 4, title: 'nextjs' },
    { id: 5, title: 'etc' },
  ];

  await prisma.folder.createMany({
    data: folders,
  });

  // User
  const users = await Promise.all(
    [
      { name: 'yujin', email: 'yujin@email.com', isadmin: true },
      { name: 'jini', email: 'jini@gmail.com', isadmin: false },
      { name: 'guest', email: 'guest@email.com', isadmin: false },
    ].map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          passwd: '1234',
          isadmin: u.isadmin,
        },
      }),
    ),
  );

  const admin = users.find((u) => u.isadmin)!;
  const guest = users.find((u) => !u.isadmin)!;

  // post
  const posts = [];

  for (let i = 0; i < 10; i++) {
    const folder = folders[i % folders.length];
    const writer = i % 2 === 0 ? admin : guest;

    const post = await prisma.post.create({
      data: {
        title: `테스트 게시글 ${i + 1}`,
        content: `이것은 ${folder.title} 카테고리의 테스트 게시글입니다.`,
        folder: folder.id,
        writer: writer.id,
        createdAt: new Date(Date.now() - i * 86400000),
      },
    });

    // comment (댓글)
    const comments = [];

    for (const post of posts.slice(0, 5)) {
      const comment = await prisma.comment.create({
        data: {
          postid: post.id,
          writer: guest.id,
          content: `이 게시글(${post.id})에 대한 댓글입니다.`,
        },
      });
      comments.push(comment);
    }

    // reply (대댓글)
    for (const comment of comments) {
      await prisma.comment.create({
        data: {
          postid: comment.postid,
          parentid: comment.id,
          writer: admin.id,
          content: '관리자 답글입니다.',
        },
      });
    }

    posts.push(post);
  }

  console.log('Seed data inserted');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
