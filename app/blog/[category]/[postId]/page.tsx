import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { BlogCategoryNav } from '@/components/BlogCategoryNav';
import Comment from '@/components/Comment';
import LikeButton from '@/components/LikeButton';
import { auth } from '@/lib/auth';
import { deletePost } from '@/lib/blog.action';
import { CATEGORIES } from '@/lib/categories';
import { getPostById } from '@/lib/post';
import { prisma } from '@/lib/prisma';

export default async function PostPage({
  params,
}: {
  params: { category: string; postId: string };
}) {
  const { category, postId } = await params;

  const id = Number(postId);
  if (Number.isNaN(id)) notFound();

  // label 매핑
  const cat = CATEGORIES.find((c) => c.value === category);
  if (!cat) notFound();

  const post = await getPostById(id);
  if (!post) redirect(`/blog/${category}`);
  if (post.Folder.title.toLowerCase() !== cat.value.toLowerCase())
    redirect(`/blog/${category}`);

  const session = await auth();
  const isLoggedIn = !!session?.user?.email;
  const isAdmin = !!session?.user?.isadmin;

  // 좋아요 클릭 여부
  const myEmail = session?.user?.email;
  const myUser = myEmail
    ? await prisma.user.findUnique({
        where: { email: myEmail },
        select: { id: true },
      })
    : null;

  const liked = myUser
    ? post.PostLike.some((l) => l.userid === myUser.id)
    : false;

  const path = `/blog/${category}/${post.id}`;

  return (
    <div className="mx-auto flex gap-8 px-8 py-6">
      {/* 좌측 카테고리 */}
      <aside className="w-48 shrink-0">
        <BlogCategoryNav />
      </aside>

      {/* 우측 post */}
      <main className="flex min-w-0 flex-1">
        <article className="w-full px-8 py-8">
          {/* Post Header */}
          <header className="mb-10 border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{cat.label}</p>
                <h1 className="mt-2 font-bold text-3xl leading-tight">
                  {post.title}
                </h1>

                <div className="mt-3 text-muted-foreground text-sm">
                  <span className="text-black">{post.User.name}</span>
                  {' • '}
                  {new Date(post.createdAt).toLocaleString()}
                  {post.updatedAt &&
                    new Date(post.updatedAt).getTime() !==
                      new Date(post.createdAt).getTime() && (
                      <>
                        {' / '}
                        수정: {new Date(post.updatedAt).toLocaleString()}
                        <span className="ml-1 text-gray-400">(수정됨)</span>
                      </>
                    )}
                </div>
              </div>

              {/* 관리자 영역 - 수정 / 삭제 */}
              {isAdmin && (
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/blog/edit/${post.id}`}
                    className="rounded-md border px-3 py-1 text-blue-600 text-sm hover:bg-blue-50"
                  >
                    수정
                  </Link>

                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="category" value={category} />
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-1 text-red-600 text-sm hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              )}
            </div>
          </header>

          <div className="prose mt-6">{post.content}</div>

          <div className="mt-8 flex gap-3">
            <LikeButton
              postId={post.id}
              count={post.PostLike.length}
              path={path}
              initialLiked={liked}
              isLoggedIn={isLoggedIn}
            />

            <span className="inline-flex items-center gap-2 rounded border px-3 py-1 text-sm">
              💬{' '}
              {post.Comment.reduce(
                (acc, c) => acc + 1 + c.other_Comment.length,
                0,
              )}
            </span>
          </div>

          <Comment
            postId={post.id}
            comments={post.Comment}
            path={path}
            isLoggedIn={isLoggedIn}
          />
        </article>
      </main>
    </div>
  );
}
