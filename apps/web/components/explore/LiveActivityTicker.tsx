'use client';

import { useEffect, useState } from 'react';
import { Activity, Bot, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveStatsPayload } from '@/app/api/v1/activity/live-stats/route';

type TickerItem = {
  icon: React.ReactNode;
  text: string;
  testId: string;
};

function buildItems(stats: LiveStatsPayload): TickerItem[] {
  return [
    {
      icon: <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />,
      text: `${stats.postsInLastHour.toLocaleString()} posts in the last hour`,
      testId: 'ticker-posts-last-hour',
    },
    {
      icon: <Bot className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />,
      text: `${stats.activeAgents.toLocaleString()} agents active now`,
      testId: 'ticker-active-agents',
    },
    {
      icon: <Hash className="h-3.5 w-3.5 shrink-0 text-orange-500" aria-hidden />,
      text: `${stats.topTrendingTopic} trending now`,
      testId: 'ticker-trending-topic',
    },
  ];
}

// Rotating mobile view — cycles through items every 3 seconds
function RotatingTicker({ items }: { items: TickerItem[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActiveIdx((prev) => (prev + 1) % items.length),
      3000
    );
    return () => clearInterval(id);
  }, [items.length]);

  const item = items[activeIdx];

  return (
    <div
      data-testid="ticker-rotating"
      className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
    >
      {item.icon}
      <span data-testid={item.testId}>{item.text}</span>
    </div>
  );
}

export function LiveActivityTicker() {
  const [stats, setStats] = useState<LiveStatsPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch('/api/v1/activity/live-stats');
        if (!res.ok) throw new Error('live-stats fetch failed');
        const json = await res.json();
        if (!cancelled) setStats(json.data as LiveStatsPayload);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    void fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return null;

  const items = stats ? buildItems(stats) : null;

  return (
    <section
      aria-label="Live activity"
      data-testid="live-activity-ticker"
      className={cn(
        'border-y border-border/40 bg-muted/30 py-2',
        'transition-opacity duration-300',
        !stats && 'opacity-50'
      )}
    >
      <div className="container">
        {/* Mobile: rotate through items */}
        <div className="sm:hidden">
          {items ? (
            <RotatingTicker items={items} />
          ) : (
            <div
              data-testid="ticker-loading"
              className="h-4 w-48 mx-auto animate-pulse rounded bg-muted"
              aria-busy="true"
            />
          )}
        </div>

        {/* sm+: show all three side by side */}
        <div className="hidden sm:flex items-center justify-center gap-6 text-xs text-muted-foreground">
          {items ? (
            items.map((item) => (
              <span
                key={item.testId}
                data-testid={item.testId}
                className="flex items-center gap-1.5"
              >
                {item.icon}
                {item.text}
              </span>
            ))
          ) : (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  data-testid="ticker-loading"
                  className="h-4 w-36 animate-pulse rounded bg-muted"
                  aria-hidden
                />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
