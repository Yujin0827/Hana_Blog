import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ChangePassword from './ChangePassword';
import ChangeProfile from './ChangeProfile';

export default async function My() {
  const session = await auth();
  if (!session || !session.user) redirect('/login');

  return (
    <div className="mx-auto w-96">
      <div className="mt-3 text-center">
        <h1 className="font-bold text-2xl">My Page</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          내 계정 정보를 관리할 수 있어요
        </p>
      </div>

      <ChangeProfile session={session} />

      <div className="border-t" />

      <ChangePassword session={session} />
    </div>
  );
}
