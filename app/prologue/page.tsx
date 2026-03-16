import type { Metadata } from 'next';
import Link from 'next/link';
import { GrassLayout } from '@/components/GrassLayout';
import ProfileCard from '@/components/ProfileCard';
import { getGrassActivity } from '@/lib/activity';
import { getRecentPosts } from '@/lib/post';

export const metadata: Metadata = {
  title: 'Prologue | Yujin Blog',
  description:
    '유진의 개발 기록과 성장 과정, 그리고 프로젝트 히스토리를 담은 프롤로그 페이지입니다.',
  openGraph: {
    title: 'Prologue | Yujin Blog',
    description: '유진의 개발 기록과 성장 과정, 그리고 프로젝트 히스토리',
    url: 'http://localhost:3000/prologue',
    siteName: 'Yujin Blog',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default async function ProloguePage() {
  const activityByYear = await getGrassActivity();
  const recentPosts = await getRecentPosts(4);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex gap-10">
        {/* 좌측 사이드바 */}
        <aside className="w-64 shrink-0 space-y-6">
          <ProfileCard />
        </aside>

        {/* 우측 콘텐츠 */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* about */}
          <section className="rounded-lg border p-5">
            <h2 className="font-semibold">About</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              개발을 기록하고 성장 과정을 남기는 공간입니다.
            </p>
          </section>

          {/* 잔디밭 */}
          <GrassLayout activityByYear={activityByYear} />

          {/* 최신글 */}
          <section className="rounded-lg border p-5">
            <h2 className="mb-3 font-bold">최신 글</h2>

            <ul className="space-y-3">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.Folder.title.toLowerCase()}/${post.id}`}
                    className="block"
                  >
                    <p className="truncate font-medium text-sm hover:underline">
                      {post.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-right">
              <Link
                href="/blog"
                className="text-blue-600 text-xs hover:underline"
              >
                전체 글 보기 →
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
