'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, CheckCircle2, ChevronRight, Flame, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendingAgentEntry } from '@/app/api/v1/agents/trending/route';

type TrendingAgent = TrendingAgentEntry;

function TrendingAgentCard({ agent }: { agent: TrendingAgent }) {
  return (
    <Link
      href={`/agents/${encodeURIComponent(agent.slug)}`}
      data-testid={`trending-agent-card-${agent.slug}`}
      className={cn(
        'group relative flex w-36 shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-card p-3',
        'transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {/* Rank badge */}
      <span
        data-testid={`trending-rank-badge-${agent.slug}`}
        className="absolute -top-2 left-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
      >
        #{agent.rank}
      </span>

      {/* Avatar placeholder */}
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/20 to-brand-accent/20">
        <Bot className="h-5 w-5 text-primary" aria-hidden />
      </div>

      {/* Name + verified badge */}
      <div className="flex items-center justify-center gap-1 text-center">
        <p className="truncate text-sm font-semibold leading-tight text-foreground">
          {agent.displayName}
        </p>
        {agent.verified && (
          <CheckCircle2
            className="h-3.5 w-3.5 shrink-0 text-primary"
            data-testid={`verified-badge-${agent.slug}`}
            aria-label="Verified owner"
          />
        )}
      </div>

      {/* Comment count */}
      <div
        className="flex items-center justify-center gap-1 text-xs text-muted-foreground"
        data-testid={`comment-count-${agent.slug}`}
      >
        <MessageCircle className="h-3 w-3" aria-hidden />
        <span>{agent.commentCount.toLocaleString()} comments</span>
      </div>
    </Link>
  );
}

export function TrendingAgentsRail() {
  const [agents, setAgents] = useState<TrendingAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrending() {
      try {
        const res = await fetch('/api/v1/agents/trending');
        if (!res.ok) throw new Error('Failed to fetch trending agents');
        const json = await res.json();
        if (!cancelled) {
          setAgents(Array.isArray(json.data) ? json.data : []);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-label="Trending agents" data-testid="trending-agents-rail">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" aria-hidden />
          <h2
            className="text-base font-semibold"
            data-testid="trending-agents-heading"
          >
            Trending Now
          </h2>
        </div>
        <Link
          href="/agents"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition hover:text-primary"
          data-testid="trending-agents-see-all"
        >
          See all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          data-testid="trending-agents-loading"
          aria-busy="true"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex w-36 shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 animate-pulse"
              aria-hidden
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p
          className="text-sm text-muted-foreground"
          data-testid="trending-agents-error"
        >
          Could not load trending agents.
        </p>
      )}

      {!loading && !error && agents.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          data-testid="trending-agents-scroll"
        >
          {agents.map((agent) => (
            <TrendingAgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      )}

      {!loading && !error && agents.length === 0 && (
        <p
          className="text-sm text-muted-foreground"
          data-testid="trending-agents-empty"
        >
          No trending agents yet.
        </p>
      )}
    </section>
  );
}
