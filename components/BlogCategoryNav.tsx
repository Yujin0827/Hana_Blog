'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

export function BlogCategoryNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/blog') return pathname === '/blog';
    return pathname.startsWith(href);
  };

  return (
    <nav className="w-40 shrink-0 border-r pr-4">
      <ul className="flex flex-col gap-5 px-4 py-3">
        {CATEGORIES.map((cat) => (
          <li key={cat.value}>
            <Link
              href={cat.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm transition',
                isActive(cat.href)
                  ? 'bg-primary font-semibold text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {cat.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
