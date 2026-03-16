'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 로그인 체크
function requireUser(session: { user?: { email?: string | null } } | null) {
  const email = session?.user?.email;
  if (!email) throw new Error('LOGIN_REQUIRED');
  return email;
}

// 본인 계정 조회
export async function getMyUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isadmin: true },
  });
  if (!user) throw new Error('USER_NOT_FOUND');
  return user;
}

// 현재 로그인한 유저
export async function getUser() {
  const session = await auth();
  const email = requireUser(session);
  return await getMyUserIdByEmail(email);
}

// 좋아요
export async function toggleLike(postId: number, pathToRevalidate: string) {
  const me = await getUser();

  const existed = await prisma.postLike.findFirst({
    where: { userid: me.id, postid: postId },
    select: { id: true },
  });

  if (existed) {
    await prisma.postLike.delete({ where: { id: existed.id } });
  } else {
    await prisma.postLike.create({
      data: { userid: me.id, postid: postId },
    });
  }

  revalidatePath(pathToRevalidate);
}

// 댓글 등록
export async function addComment(
  postId: number,
  content: string,
  pathToRevalidate: string,
) {
  const me = await getUser();

  const text = content.trim();
  if (!text) return;

  await prisma.comment.create({
    data: {
      postid: postId,
      writer: me.id,
      content: text,
    },
  });

  revalidatePath(pathToRevalidate);
}

// 답글(대댓글) 등록
export async function addReply(
  postId: number,
  parentId: number,
  content: string,
  pathToRevalidate: string,
) {
  const me = await getUser();

  const text = content.trim();
  if (!text) return;

  await prisma.comment.create({
    data: {
      postid: postId,
      parentid: parentId,
      writer: me.id,
      content: text,
    },
  });

  revalidatePath(pathToRevalidate);
}

// 댓글 삭제 (작성자 또는 관리자)
export async function deleteComment(commentId: number, path: string) {
  const me = await getUser();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, writer: true },
  });
  if (!comment) return;

  const isOwner = comment.writer === me.id;
  const isAdmin = me.isadmin;

  if (!isOwner && !isAdmin) {
    throw new Error('FORBIDDEN');
  }

  if (isAdmin && !isOwner) {
    // 관리자 : 타인 댓글 → "삭제된 댓글입니다" 표시
    await prisma.comment.update({
      where: { id: commentId },
      data: { isdeleted: true, content: null },
    });
  } else {
    // 작성자 본인 → 삭제
    await prisma.comment.delete({ where: { id: commentId } });
  }

  revalidatePath(path);
}

// 댓글 수정 (작성자 또는 관리자)
export async function updateComment(
  commentId: number,
  content: string,
  pathToRevalidate: string,
) {
  const me = await getUser();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, writer: true },
  });
  if (!comment) return;

  const canEdit = me.isadmin || comment.writer === me.id;
  if (!canEdit) throw new Error('FORBIDDEN');

  const text = content.trim();
  if (!text) return;

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: text,
      updatedAt: new Date(),
    },
  });

  revalidatePath(pathToRevalidate);
}

// 게시글 삭제
export async function deletePost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isadmin) {
    throw new Error('ADMIN_ONLY');
  }

  const postId = Number(formData.get('postId'));
  const category = String(formData.get('category'));

  if (!postId || !category) {
    throw new Error('INVALID_DATA');
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    redirect('/blog');
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${category}`);

  redirect('/blog');
}
