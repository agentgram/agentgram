'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Bot,
  ChevronRight,
  Heart,
  Layers,
  Sparkles,
} from 'lucide-react';
import { API_BASE_PATH } from '@agentgram/shared';
import { cn } from '@/lib/utils';
import type { AgentsDirectoryAgent, AgentsDirectoryResponse } from '@/lib/agents/directory-shared';

const CARDS_PER_ROW = 8;

type ThemeConfig = {
  id: string;
  label: string;
  description: string;
  icon: typeof Heart;
  iconClassName: string;
  seeAllHref: string;
  fetchParams: Record<string, string>;
};

const THEMES: ThemeConfig[] = [
  {
    id: 'wellness',
    label: 'Wellness',
    description: 'Agents focused on support, reflection, and companionship',
    icon: Heart,
    iconClassName: 'text-rose-500',
    seeAllHref: '/agents?relationship_goal=companionship',
    fetchParams: { relationship_goal: 'companionship', sort: 'axp', limit: String(CARDS_PER_ROW) },
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Imaginative agents for fantasy worlds and creative exploration',
    icon: Sparkles,
    iconClassName: 'text-violet-500',
    seeAllHref: '/agents?worldbuilding=fantasy',
    fetchParams: { worldbuilding: 'fantasy', sort: 'axp', limit: String(CARDS_PER_ROW) },
  },
  {
    id: 'study-buddy',
    label: 'Study Buddy',
    description: 'Agents built for guidance, learning, and skill development',
    icon: BookOpen,
    iconClassName: 'text-blue-500',
    seeAllHref: '/agents?relationship_goal=guidance',
    fetchParams: { relationship_goal: 'guidance', sort: 'axp', limit: String(CARDS_PER_ROW) },
  },
  {
    id: 'roleplay',
    label: 'Roleplay',
    description: 'Character-driven agents ready for immersive role-play sessions',
    icon: Layers,
    iconClassName: 'text-amber-500',
    seeAllHref: '/agents?roleplay=true',
    fetchParams: { roleplay: 'true', sort: 'axp', limit: String(CARDS_PER_ROW) },
  },
];

function useThemeAgents(fetchParams: Record<string, string>) {
  const queryKey = ['agents', 'usecase-row', fetchParams];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams(fetchParams);
      const res = await fetch(`${API_BASE_PATH}/agents?${params.toString()}`);
      const json = (await res.json()) as AgentsDirectoryResponse;
      if (!res.ok || !json.success) return [];
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function AgentMiniCard({ agent }: { agent: AgentsDirectoryAgent }) {
  const displayName = agent.display_name ?? agent.displayName ?? agent.name;
  const avatarUrl = agent.avatar_url ?? agent.avatarUrl;

  return (
    <Link
      href={`/agents/${encodeURIComponent(agent.name)}`}
      data-testid={`usecase-agent-card-${agent.id}`}
      className={cn(
        'group flex w-44 shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-card p-3',
        'transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/20 to-brand-accent/20">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <Bot className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {displayName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">@{agent.name}</p>
        </div>
      </div>
      {agent.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {agent.description}
        </p>
      )}
    </Link>
  );
}

function AgentMiniCardSkeleton() {
  return (
    <div className="flex w-44 shrink-0 animate-pulse flex-col gap-2 rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 space-y-1">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-2.5 w-14 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-2.5 w-full rounded bg-muted" />
        <div className="h-2.5 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}

function ThemeRow({ theme }: { theme: ThemeConfig }) {
  const { data: agents, isLoading } = useThemeAgents(theme.fetchParams);
  const Icon = theme.icon;

  if (!isLoading && (!agents || agents.length === 0)) {
    return null;
  }

  return (
    <section
      aria-label={`${theme.label} agents`}
      data-testid={`usecase-row-${theme.id}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', theme.iconClassName)} aria-hidden />
          <h2 className="text-base font-semibold">{theme.label}</h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            — {theme.description}
          </p>
        </div>
        <Link
          href={theme.seeAllHref}
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition hover:text-primary"
          data-testid={`usecase-row-${theme.id}-see-all`}
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        data-testid={`usecase-row-${theme.id}-scroll`}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <AgentMiniCardSkeleton key={i} />
            ))
          : agents!.map((agent) => (
              <AgentMiniCard key={agent.id} agent={agent} />
            ))}
      </div>
    </section>
  );
}

export function UsecaseCollectionRows() {
  return (
    <div
      className="space-y-6"
      data-testid="usecase-collection-rows"
      aria-label="Use-case collections"
    >
      {THEMES.map((theme) => (
        <ThemeRow key={theme.id} theme={theme} />
      ))}
    </div>
  );
}
