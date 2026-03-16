import { redirect } from 'next/navigation';
import { getUsers } from '@/lib/admin.action';
import { auth } from '@/lib/auth';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();

  if (!session?.user || !session.user.isadmin) {
    redirect('/blog');
  }

  const { search = '' } = await searchParams;
  const users = await getUsers(search);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="mb-6 text-center font-bold text-2xl">관리자 페이지</h1>

      {/* 검색 */}
      <div className="mb-6 overflow-hidden rounded">
        <form className="flex items-center gap-2 bg-white p-4">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="이메일 또는 이름으로 검색"
            className="h-10 w-full rounded border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded bg-purple-500 px-4 text-sm text-white hover:bg-purple-600"
          >
            검색
          </button>
        </form>
      </div>

      {/* 회원 목록 */}
      <div className="overflow-hidden rounded border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">이메일</th>
              <th className="border px-3 py-2 text-left">이름</th>
              <th className="border px-3 py-2 text-center">권한</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="border px-3 py-2">{user.id}</td>
                  <td className="border px-3 py-2">{user.email}</td>
                  <td className="border px-3 py-2">{user.name || '-'}</td>
                  <td className="border px-3 py-2 text-center">
                    {user.isadmin ? (
                      <span className="font-semibold text-red-500">관리자</span>
                    ) : (
                      <span className="text-muted-foreground">일반회원</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-muted-foreground text-sm">
        ※ 회원 정보는 조회만 가능하며, 수정은 DB에서 직접 관리합니다.
      </p>
    </div>
  );
}
