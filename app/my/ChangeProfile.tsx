'use client';

import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changeProfile } from '@/lib/sign.action';
import type { ValidError } from '@/lib/validator';

export default function ChangeProfile({ session }: { session: Session }) {
  const { update } = useSession();
  const router = useRouter();

  const {
    user: { email, name, image },
  } = session;

  const defaultError =
    process.env.NODE_ENV === 'development'
      ? { error: {}, data: { email, name, image } }
      : undefined;

  const [validError, change, isPending] = useActionState(
    async (_: ValidError | undefined, formData: FormData) => {
      const [err, data] = await changeProfile(formData);
      if (err) return err;
      await update(data);
      router.refresh();
      alert("Your profile's updated");
      const { email, name, image } = data;
      return { error: {}, data: { email, name, image } };
    },
    defaultError,
  );
  return (
    <form action={change} className="my-3 space-y-2 rounded-md border p-5">
      <div>
        <h2 className="font-medium text-sm">Profile</h2>
        <p className="text-muted-foreground text-xs">
          이메일, 이름, 프로필 이미지를 수정할 수 있어요
        </p>
      </div>

      <div className="py-2">
        <div className="border-t" />
      </div>

      <input type="hidden" name="prevEmail" defaultValue={email || ''} />

      <div className="space-y-1">
        <Label htmlFor="email">email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={validError?.data.email || ''}
          placeholder="user@email.com"
          className="w-full"
        />
        {validError?.error.email && (
          <p className="text-red-500">{validError.error.email}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="name">name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={validError?.data.name || ''}
          placeholder="nickname..."
          className="w-full"
        />
        {validError?.error.name && (
          <p className="text-red-500">{validError.error.name}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="image">Profile Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          placeholder="profile image..."
        />
        {validError?.error.image && (
          <p className="text-red-500">{validError.error.image}</p>
        )}
      </div>

      <div className="text-center">
        <Button type="submit" disabled={isPending} className="mt-3">
          Save Profile {isPending && '...'}
        </Button>
      </div>
    </form>
  );
}
