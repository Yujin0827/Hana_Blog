import Link from 'next/link';
import { BlogCategoryNav } from '@/components/BlogCategoryNav';
import BlogPostList from '@/components/BlogPostList';
import { auth } from '@/lib/auth';
import { getPostsByCategory } from '@/lib/post';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { category } = await params;
  const { search = '' } = await searchParams;

  const posts = await getPostsByCategory(category, search);

  const session = await auth();
  const isAdmin = !!session?.user?.isadmin;

  return (
    <div className="flex gap-8 px-8 py-6">
      {/* 좌측 카테고리 */}
      <aside className="w-48 shrink-0">
        <BlogCategoryNav />
      </aside>

      <main className="flex-1 space-y-4">
        {/* 상단 검색 + 글쓰기 */}
        <div className="mb-6 flex items-center gap-4">
          {/* 검색 */}
          <form className="flex flex-1 gap-2">
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="제목 또는 내용으로 검색"
              className="h-10 w-full rounded border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="h-10 w-20 rounded bg-purple-500 px-4 text-sm text-white hover:bg-purple-600"
            >
              검색
            </button>
          </form>

          {/* 관리자일 경우 - 글쓰기 */}
          {isAdmin && (
            <Link
              href="/blog/edit"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-purple-500 px-4 font-medium text-sm text-white hover:bg-purple-600"
            >
              ✏️ 글쓰기
            </Link>
          )}
        </div>

        {/* 게시물 목록 */}
        <BlogPostList posts={posts} category={category} />
      </main>
    </div>
  );
}
