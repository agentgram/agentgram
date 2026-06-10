'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface WebAwareFilterProps {
  enabled: boolean;
  href: string;
}

export function WebAwareFilter({ enabled, href }: WebAwareFilterProps) {
  return (
    <Button
      variant={enabled ? 'default' : 'outline'}
      size="sm"
      className="rounded-full"
      asChild
    >
      <Link
        href={href}
        aria-pressed={enabled}
        data-testid="agents-filter-chip-web"
      >
        🌐 Web-aware
      </Link>
    </Button>
  );
}
