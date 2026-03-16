'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getMyUserIdByEmail } from '@/lib/blog.action';
import { prisma } from '@/lib/prisma';

export type Post = {
  folder: number;
  title: string;
  content: string;
};

export type PostError = { error: string; data?: Partial<Post> };

function requireAdmin(
  session: { user?: { email?: string | null; isadmin?: boolean } } | null,
) {
  if (!session?.user?.email) throw new Error('LOGIN_REQUIRED');
  if (!session.user.isadmin) throw new Error('ADMIN_ONLY');
  return session.user.email;
}

// 글쓰기
export async function savePost(
  formData: FormData,
): Promise<[PostError] | [undefined, Post]> {
  const session = await auth();
  const email = requireAdmin(session);
  const writer = await getMyUserIdByEmail(email);

  const folder = Number(formData.get('folder'));
  const title = formData.get('title') as string;
  const content = (formData.get('content') as string) || '';

  const data = { folder, title, content };

  if (!title) return [{ error: '제목을 입력해주세요.', data }];
  if (!content) return [{ error: '내용을 입력해주세요.', data }];

  await prisma.post.create({
    data: {
      title,
      content,
      folder,
      writer: writer.id,
    },
  });

  revalidatePath('/blog');
  return [undefined, data];
}

// 수정
export async function updatePost(
  postId: number,
  formData: FormData,
): Promise<PostError | undefined> {
  const session = await auth();
  const email = requireAdmin(session);

  const title = formData.get('title') as string;
  const content = (formData.get('content') as string) || '';

  if (!title) return { error: '제목을 입력해주세요.' };
  if (!content) return { error: '내용을 입력해주세요.' };

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
    },
  });

  revalidatePath('/blog');
}

// 삭제
export async function deletePost(formData: FormData) {
  const session = await auth();
  requireAdmin(session);

  const postId = Number(formData.get('postId'));
  if (!postId) throw new Error('INVALID_POST_ID');

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { folder: true },
  });
  if (!post) throw new Error('POST_NOT_FOUND');

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.folder}`);
  redirect('/blog');
}
