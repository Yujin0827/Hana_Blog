import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  createdAt: Date;
  Folder: { title: string };
  PostLike: { id: number }[];
  Comment: { id: number }[];
};

export default function BlogPostList({
  posts,
  category,
}: {
  posts: Post[];
  category?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        검색 결과가 없습니다.
      </div>
    );
  }
  return (
    <div className="w-full space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="rounded border p-4">
          <Link
            href={`/blog/${category ?? post.Folder.title.toLowerCase()}/${post.id}`}
          >
            {/* 카테고리 */}
            <p className="mb-1 text-muted-foreground text-xs">
              {post.Folder.title}
            </p>

            {/* 제목 */}
            <h2 className="font-semibold text-lg">{post.title}</h2>
          </Link>

          <div className="mt-2 flex gap-4 text-muted-foreground text-sm">
            <span>❤️ {post.PostLike.length}</span>
            <span>💬 {post.Comment.length}</span>
            <span>{post.createdAt.toLocaleString()}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
