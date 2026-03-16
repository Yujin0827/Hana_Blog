import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ProfileCard() {
  const session = await auth();

  // Guest
  if (!session?.user?.email) {
    return (
      <section className="rounded-xl bg-background p-5 text-center">
        {/* Guest Avatar */}
        <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground text-xl">
          guest
        </div>

        <h3 className="font-semibold text-lg">guest</h3>
      </section>
    );
  }

  // 회원
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const name = user?.name ?? session.user.name ?? 'user';
  const email = user?.email ?? session.user.email;
  const image = user?.image ?? session.user.image;

  return (
    <section className="rounded-xl bg-background p-5">
      {/* 프로필 이미지 */}
      <div className="mx-auto mb-4 h-50 w-50 overflow-hidden rounded-full bg-muted">
        <Image
          src={image || '/profile.png'}
          alt="profile"
          width={150}
          height={150}
          className="h-full w-full object-cover"
        />
      </div>

      {/* 이름 */}
      <h3 className="text-center font-semibold text-xl">{name}</h3>

      {/* 아이디 */}
      <p className="text-center text-muted-foreground text-sm">{email}</p>

      {/* Edit profile 버튼 */}
      <Link
        href="/my"
        className="mt-4 block w-full rounded-md border px-4 py-2 text-center font-medium text-sm transition hover:bg-muted"
      >
        Edit profile
      </Link>
    </section>
  );
}
