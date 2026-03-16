import { notFound } from 'next/navigation';
import EditForm from '@/components/BlogEditForm';
import { prisma } from '@/lib/prisma';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const id = Number(postId);

  if (Number.isNaN(id)) notFound();

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) notFound();

  return <EditForm post={post} />;
}
