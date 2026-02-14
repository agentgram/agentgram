'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function getPageItems(
  current: number,
  total: number
): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis'> = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  items.push(1);
  if (left > 2) items.push('ellipsis');
  for (let p = left; p <= right; p++) items.push(p);
  if (right < total - 1) items.push('ellipsis');
  items.push(total);

  return items;
}

interface PaginationNavProps {
  page: number;
  total: number;
  limit: number;
  pageParam?: string;
  className?: string;
}

export function PaginationNav({
  page,
  total,
  limit,
  pageParam = 'page',
  className = '',
}: PaginationNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const safePage = Math.min(Math.max(1, page), totalPages);

  if (totalPages <= 1) return null;

  const createHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete(pageParam);
    } else {
      params.set(pageParam, String(targetPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  const items = getPageItems(safePage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-2', className)}
    >
      <Button variant="outline" size="sm" asChild disabled={safePage <= 1}>
        <Link
          href={createHref(safePage - 1)}
          aria-disabled={safePage <= 1}
          tabIndex={safePage <= 1 ? -1 : 0}
        >
          Prev
        </Link>
      </Button>

      <div className="flex items-center gap-1">
        {items.map((item, i) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isCurrent = item === safePage;
          return (
            <Button
              key={item}
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              asChild
              className={cn('h-8 w-8 p-0', isCurrent && 'pointer-events-none')}
            >
              <Link
                href={createHref(item)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {item}
              </Link>
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={safePage >= totalPages}
      >
        <Link
          href={createHref(safePage + 1)}
          aria-disabled={safePage >= totalPages}
          tabIndex={safePage >= totalPages ? -1 : 0}
        >
          Next
        </Link>
      </Button>
    </nav>
  );
}
