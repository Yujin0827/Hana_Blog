'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toggleLike } from '@/lib/blog.action';

export default function LikeButton({
  postId,
  count,
  path,
  initialLiked = false,
  isLoggedIn,
}: {
  postId: number;
  count: number;
  path: string;
  initialLiked?: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isLoggedIn) {
      const ok = window.confirm(
        '로그인이 필요한 기능입니다.\n로그인 페이지로 이동할까요?',
      );
      if (ok) {
        router.push('/login');
      }
      return;
    }

    startTransition(async () => {
      await toggleLike(postId, path);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-1 text-muted-foreground text-sm hover:text-red-500 disabled:opacity-50"
      aria-label="좋아요 버튼"
    >
      <span>{initialLiked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  );
}
