'use client';

import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useReducer } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const DummyProfileImage = '/profile/profile.JPG';

export default function UserProfile({ data }: { data: Session }) {
  const router = useRouter();
  const [isOpen, toggleOpen] = useReducer((p) => !p, false);

  const profileImg = data.user.image || DummyProfileImage;
  const isMobile = useIsMobile();

  const Comp = isMobile
    ? { comp: Popover, trigger: PopoverTrigger, content: PopoverContent }
    : { comp: HoverCard, trigger: HoverCardTrigger, content: HoverCardContent };

  const handleLogout = async () => {
    if (isOpen) toggleOpen();

    await signOut({
      callbackUrl: '/prologue',
    });
  };

  const goToMyInfo = () => {
    toggleOpen();
    router.push('/my');
  };

  return (
    <Comp.comp open={isOpen} onOpenChange={toggleOpen}>
      <Comp.trigger asChild>
        <Button
          variant="ghost"
          className="touch-none md:pointer-events-auto md:touch-auto"
        >
          <Avatar>
            <AvatarImage
              src={isMobile ? profileImg : undefined}
              alt={(data.user?.name || 'guest').slice(0, 2)}
            />
            <AvatarFallback className="text-xl uppercase">
              {data.user?.name || 'GU'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </Comp.trigger>
      <Comp.content side="right" className="w-80">
        <div className="flex gap-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profileImg} />
            <AvatarFallback>GU</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <p className="font-semibold">@{data.user?.name}</p>
            <p className="text-muted-foreground text-sm">{data.user?.email}</p>

            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={handleLogout}>
                LogOut
              </Button>
              <Button size="sm" variant="outline" onClick={goToMyInfo}>
                My Info
              </Button>
            </div>
          </div>
        </div>
      </Comp.content>
    </Comp.comp>
  );
}
