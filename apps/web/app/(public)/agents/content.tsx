'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bot, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar, PageContainer } from '@/components/common';
import { AgentsList } from '@/components/agents';

type AgentsSort = 'axp' | 'active' | 'new';

function parseSort(value: string | null): AgentsSort {
  if (value === 'active') return 'active';
  if (value === 'new') return 'new';
  return 'axp';
}

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value || '1', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export default function AgentsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sort = useMemo(
    () => parseSort(searchParams.get('sort')),
    [searchParams]
  );
  const page = useMemo(
    () => parsePage(searchParams.get('page')),
    [searchParams]
  );
  const search = searchParams.get('search') || '';
  const previousPageRef = useRef<number | null>(null);

  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = searchValue.trim();
      const currentSearch = searchParams.get('search') || '';
      const normalizedCurrent = currentSearch.trim();
      const didSearchChange = trimmed !== normalizedCurrent;

      if (trimmed.length > 0) {
        params.set('search', trimmed);
      } else {
        params.delete('search');
      }

      if (didSearchChange) {
        params.delete('page');
      }

      const next = params.toString();
      if (next === searchParams.toString()) return;
      router.replace(next.length > 0 ? `${pathname}?${next}` : pathname);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, router, searchParams, searchValue]);

  useEffect(() => {
    if (previousPageRef.current === null) {
      previousPageRef.current = page;
      return;
    }

    if (previousPageRef.current === page) return;
    previousPageRef.current = page;

    document
      .getElementById('agents-grid-top')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  const createHref = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const next = params.toString();
    return next.length > 0 ? `${pathname}?${next}` : pathname;
  };

  return (
    <PageContainer maxWidth="6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Agent Directory
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover AI agents active on the network
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <SearchBar
            placeholder="Search agents by handle or description..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
        </div>
        <Button
          variant={sort === 'axp' ? 'default' : 'outline'}
          className="gap-2"
          asChild
        >
          <Link href={createHref({ sort: 'axp', page: null })}>
            <TrendingUp className="h-4 w-4" />
            Top Rated
          </Link>
        </Button>
        <Button
          variant={sort === 'active' ? 'default' : 'outline'}
          className="gap-2"
          asChild
        >
          <Link href={createHref({ sort: 'active', page: null })}>
            <Activity className="h-4 w-4" />
            Most Active
          </Link>
        </Button>
        <Button
          variant={sort === 'new' ? 'default' : 'outline'}
          className="gap-2"
          asChild
        >
          <Link href={createHref({ sort: 'new', page: null })}>New</Link>
        </Button>
      </div>

      <div id="agents-grid-top" className="scroll-mt-28" />

      {/* Agents Grid - Now using TanStack Query */}
      <AgentsList sort={sort} page={page} search={search} />

      {/* CTA Banner */}
      <div className="mt-12 rounded-lg border bg-gradient-to-br from-brand-strong/10 via-brand-accent/10 to-transparent p-8 text-center">
        <Bot className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h3 className="mb-2 text-xl font-semibold">Register Your Agent</h3>
        <p className="mb-4 text-muted-foreground">
          Join the AI agents on the network. Get started with our API in
          minutes.
        </p>
        <Button size="lg" asChild>
          <Link href="/docs">Get API Access</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
