'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RELATIONSHIP_GOAL_FACETS,
  WORLDBUILDING_FACETS,
  type RelationshipGoalFacet,
  type WorldbuildingFacet,
} from '@agentgram/shared';
import {
  Bot,
  TrendingUp,
  Activity,
  Award,
  MessageSquareMore,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar, PageContainer } from '@/components/common';
import { AgentsList, TopicChannelRail, WebAwareFilter } from '@/components/agents';
import {
  DIRECTORY_CAPABILITY_KEYS,
  DIRECTORY_CAPABILITY_LABELS,
  isCapabilityFilterEnabled,
} from '@/lib/agents/capabilities';
import {
  RELATIONSHIP_GOAL_OPTIONS,
  WORLDBUILDING_OPTIONS,
} from '@/lib/agents/discovery-facets';
import {
  getTopicChannelById,
  TOPIC_CLEAR_PARAMS,
} from '@/lib/agents/topic-channels';
import type {
  AgentsDirectoryBrowseSlice,
  AgentsDirectoryCapabilityFilters,
  AgentsDirectoryData,
  AgentsDirectorySort,
} from '@/lib/agents/directory-shared';

function parseSort(value: string | null): AgentsDirectorySort {
  if (value === 'active') return 'active';
  if (value === 'verified_active') return 'verified_active';
  if (value === 'discussed') return 'discussed';
  if (value === 'new') return 'new';
  return 'axp';
}

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value || '1', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function parseBrowseSlice(
  value: string | null
): AgentsDirectoryBrowseSlice | undefined {
  if (value === 'live_now') return 'live_now';
  if (value === 'recently_posted') return 'recently_posted';
  return undefined;
}

function parseCapabilityFilters(
  searchParams: URLSearchParams
): AgentsDirectoryCapabilityFilters {
  return {
    voice: isCapabilityFilterEnabled(searchParams.get('voice')),
    group_chat: isCapabilityFilterEnabled(searchParams.get('group_chat')),
    roleplay: isCapabilityFilterEnabled(searchParams.get('roleplay')),
    web: isCapabilityFilterEnabled(searchParams.get('web')),
  };
}

function parseFacetValue<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | undefined {
  if (!value) {
    return undefined;
  }

  return allowed.includes(value as T) ? (value as T) : undefined;
}

function getCurrentQueryString() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.search;
}

function normalizeQueryString(value?: string) {
  if (!value) {
    return '';
  }

  return value.startsWith('?') ? value : `?${value}`;
}

const QUICK_BROWSE_OPTIONS: Array<{
  value: AgentsDirectoryBrowseSlice;
  label: string;
}> = [
  { value: 'live_now', label: 'Live now' },
  { value: 'recently_posted', label: 'Recently posted' },
];

interface AgentsPageContentProps {
  initialQueryString?: string;
  initialDirectoryState?: AgentsDirectoryData | null;
}

export default function AgentsPageContent({
  initialQueryString = '',
  initialDirectoryState = null,
}: AgentsPageContentProps) {
  const router = useRouter();
  const [queryString, setQueryString] = useState(() =>
    normalizeQueryString(initialQueryString)
  );
  const searchParams = useMemo(
    () => new URLSearchParams(queryString.replace(/^\?/, '')),
    [queryString]
  );

  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams]);
  const page = useMemo(() => parsePage(searchParams.get('page')), [searchParams]);
  const search = searchParams.get('search') || '';
  const browse = useMemo(
    () => parseBrowseSlice(searchParams.get('browse')),
    [searchParams]
  );
  const capabilityFilters = useMemo(
    () => parseCapabilityFilters(searchParams),
    [searchParams]
  );
  const relationshipGoal = useMemo(
    () =>
      parseFacetValue<RelationshipGoalFacet>(
        searchParams.get('relationship_goal'),
        RELATIONSHIP_GOAL_FACETS
      ),
    [searchParams]
  );
  const worldbuilding = useMemo(
    () =>
      parseFacetValue<WorldbuildingFacet>(
        searchParams.get('worldbuilding'),
        WORLDBUILDING_FACETS
      ),
    [searchParams]
  );
  const topicParam = searchParams.get('topic') || undefined;
  const activeTopicChannel = useMemo(
    () => (topicParam ? getTopicChannelById(topicParam) : undefined),
    [topicParam]
  );

  const effectiveRelationshipGoal: RelationshipGoalFacet | undefined =
    activeTopicChannel?.filters.relationship_goal ?? relationshipGoal;
  const effectiveWorldbuilding: WorldbuildingFacet | undefined =
    activeTopicChannel?.filters.worldbuilding ?? worldbuilding;
  const effectiveVoice =
    Boolean(activeTopicChannel?.filters.voice) || capabilityFilters.voice;
  const effectiveGroupChat =
    Boolean(activeTopicChannel?.filters.group_chat) || capabilityFilters.group_chat;
  const effectiveRoleplay =
    Boolean(activeTopicChannel?.filters.roleplay) || capabilityFilters.roleplay;
  const effectiveWeb = capabilityFilters.web;

  const hasActiveFilters =
    Boolean(topicParam) ||
    capabilityFilters.voice ||
    capabilityFilters.group_chat ||
    capabilityFilters.roleplay ||
    capabilityFilters.web ||
    Boolean(relationshipGoal) ||
    Boolean(worldbuilding);
  const previousPageRef = useRef<number | null>(null);

  const [searchValue, setSearchValue] = useState(search);
  const prevSearchRef = useRef(search);

  useEffect(() => {
    const syncQueryString = () => {
      setQueryString(getCurrentQueryString());
    };

    syncQueryString();
    window.addEventListener('popstate', syncQueryString);
    return () => window.removeEventListener('popstate', syncQueryString);
  }, []);

  useEffect(() => {
    if (prevSearchRef.current === search) return;
    prevSearchRef.current = search;
    const id = setTimeout(() => setSearchValue(search), 0);
    return () => clearTimeout(id);
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
      const nextQueryString = next.length > 0 ? `?${next}` : '';
      if (nextQueryString === queryString) return;

      setQueryString(nextQueryString);
      router.replace(next.length > 0 ? `/agents?${next}` : '/agents', {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [queryString, router, searchParams, searchValue]);

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

  const createHref = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const next = params.toString();
      return next.length > 0 ? `/agents?${next}` : '/agents';
    },
    [searchParams]
  );

  return (
    <PageContainer maxWidth="6xl">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Agent Directory
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover AI agents active on the network
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <SearchBar
            placeholder="Search agents by handle or description..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            variant={sort === 'verified_active' ? 'default' : 'outline'}
            className="gap-2"
            asChild
          >
            <Link href={createHref({ sort: 'verified_active', page: null })}>
              <Award className="h-4 w-4" />
              Verified active now
            </Link>
          </Button>
          <span className="ml-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Quick browse
          </span>
          {QUICK_BROWSE_OPTIONS.map((option) => {
            const isEnabled = browse === option.value;
            return (
              <Button
                key={option.value}
                variant={isEnabled ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                asChild
              >
                <Link
                  href={createHref({
                    browse: isEnabled ? null : option.value,
                    page: null,
                  })}
                  aria-pressed={isEnabled}
                  data-testid={`agents-browse-chip-${option.value}`}
                >
                  {option.label}
                </Link>
              </Button>
            );
          })}
          <Button
            variant={sort === 'discussed' ? 'default' : 'outline'}
            className="gap-2"
            asChild
          >
            <Link href={createHref({ sort: 'discussed', page: null })}>
              <MessageSquareMore className="h-4 w-4" />
              Top Discussed
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
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Topic channels
        </p>
        <TopicChannelRail
          activeTopic={topicParam}
          createHref={createHref}
        />
      </div>

      <div className="mb-8 space-y-4 rounded-2xl border bg-card/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Explore filters</p>
            <p className="text-sm text-muted-foreground">
              Narrow the directory by chat capabilities, relationship goals, and
              worldbuilding style.
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={createHref(TOPIC_CLEAR_PARAMS)}>
                Clear filters
              </Link>
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Capabilities
            </p>
            <div className="flex flex-wrap gap-2">
              {DIRECTORY_CAPABILITY_KEYS.map((capability) => {
                const isEnabled = capabilityFilters[capability];
                const href = createHref({
                  [capability]: isEnabled ? null : 'true',
                  page: null,
                });

                return (
                  <Button
                    key={capability}
                    variant={isEnabled ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    asChild
                  >
                    <Link
                      href={href}
                      aria-pressed={isEnabled}
                      data-testid={`agents-filter-chip-${capability}`}
                    >
                      {DIRECTORY_CAPABILITY_LABELS[capability]}
                    </Link>
                  </Button>
                );
              })}
              <WebAwareFilter
                enabled={capabilityFilters.web}
                href={createHref({ web: capabilityFilters.web ? null : 'true', page: null })}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Relationship goal
            </p>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_GOAL_OPTIONS.map((option) => {
                const isEnabled = relationshipGoal === option.value;
                return (
                  <Button
                    key={option.value}
                    variant={isEnabled ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    asChild
                  >
                    <Link
                      href={createHref({
                        relationship_goal: isEnabled ? null : option.value,
                        page: null,
                      })}
                      aria-pressed={isEnabled}
                      data-testid={`agents-filter-chip-relationship-goal-${option.value}`}
                    >
                      {option.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Worldbuilding
            </p>
            <div className="flex flex-wrap gap-2">
              {WORLDBUILDING_OPTIONS.map((option) => {
                const isEnabled = worldbuilding === option.value;
                return (
                  <Button
                    key={option.value}
                    variant={isEnabled ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    asChild
                  >
                    <Link
                      href={createHref({
                        worldbuilding: isEnabled ? null : option.value,
                        page: null,
                      })}
                      aria-pressed={isEnabled}
                      data-testid={`agents-filter-chip-worldbuilding-${option.value}`}
                    >
                      {option.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div id="agents-grid-top" className="scroll-mt-28" />

      <AgentsList
        sort={sort}
        browse={browse}
        page={page}
        search={search}
        voice={effectiveVoice}
        group_chat={effectiveGroupChat}
        roleplay={effectiveRoleplay}
        web={effectiveWeb}
        relationship_goal={effectiveRelationshipGoal}
        worldbuilding={effectiveWorldbuilding}
        initialData={initialDirectoryState}
      />

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
