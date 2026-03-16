'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ModeToggle } from './ModeToggle';
import UserProfile from './UserProfile';

export default function NavigatorBar() {
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated';
  const isAdmin = session?.user?.isadmin;

  return (
    <nav className="border-b">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-4">
        {/* 좌측 메뉴 */}
        <div className="flex items-center gap-4 font-medium text-sm">
          <Link href="/prologue" className="font-bold">
            HanaLog
          </Link>
          <Link href="/prologue">프롤로그</Link>
          <Link href="/blog">블로그</Link>
          {isLoggedIn && (
            <Link href="/my" className="hover:text-blue-500">
              마이페이지
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="text-red-500 hover:text-red-600">
              관리
            </Link>
          )}
        </div>

        {/* 우측 메뉴 */}
        <div className="text-sm">
          {!isLoggedIn ? (
            <div className="flex items-center gap-3 font-medium">
              <Link href="/login" className="hover:text-blue-500">
                로그인
              </Link>
              <Link href="/login?isup=true" className="hover:text-blue-500">
                회원가입
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserProfile data={session} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
