'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface DiscoveryStats {
  totalConversations: number;
  uniqueUsersReached: number;
  followerCount: number;
  weeklyTrend: number;
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DiscoveryStats }
  | { status: 'error'; message: string };

interface CreatorDiscoveryPanelProps {
  isOwner: boolean;
}

export function CreatorDiscoveryPanel({ isOwner }: CreatorDiscoveryPanelProps) {
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    if (!isOwner) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/v1/creator/discovery-stats');
        if (cancelled) return;

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setState({
            status: 'error',
            message:
              (json as { error?: { message?: string } })?.error?.message ||
              'Failed to load discovery stats',
          });
          return;
        }

        const json = await res.json();
        setState({ status: 'success', data: json.data as DiscoveryStats });
      } catch {
        if (!cancelled) {
          setState({ status: 'error', message: 'Failed to load discovery stats' });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOwner]);

  if (!isOwner || state.status === 'idle') {
    return null;
  }

  if (state.status === 'loading') {
    return (
      <div
        className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3 animate-pulse"
        data-testid="creator-discovery-panel-loading"
      >
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        data-testid="creator-discovery-panel-error"
      >
        <p className="text-sm text-destructive">{state.message}</p>
      </div>
    );
  }

  if (state.status !== 'success') {
    return null;
  }

  const { data } = state;
  const trendPositive = data.weeklyTrend >= 0;
  const trendLabel = trendPositive
    ? `+${data.weeklyTrend}`
    : String(data.weeklyTrend);

  return (
    <div
      className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3"
      data-testid="creator-discovery-panel"
    >
      <p className="text-sm font-semibold text-foreground">Discovery overview</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5" data-testid="discovery-stat-conversations">
          <p className="text-xs text-muted-foreground">Total conversations</p>
          <p className="text-lg font-bold text-foreground">
            {data.totalConversations.toLocaleString()}
          </p>
        </div>

        <div className="space-y-0.5" data-testid="discovery-stat-users-reached">
          <p className="text-xs text-muted-foreground">Unique users reached</p>
          <p className="text-lg font-bold text-foreground">
            {data.uniqueUsersReached.toLocaleString()}
          </p>
        </div>

        <div className="space-y-0.5" data-testid="discovery-stat-followers">
          <p className="text-xs text-muted-foreground">Followers</p>
          <p className="text-lg font-bold text-foreground">
            {data.followerCount.toLocaleString()}
          </p>
        </div>

        <div className="space-y-0.5" data-testid="discovery-stat-weekly-trend">
          <p className="text-xs text-muted-foreground">Weekly trend</p>
          <div className="flex items-center gap-1">
            <span
              className={`flex items-center gap-0.5 text-lg font-bold ${
                trendPositive ? 'text-green-600' : 'text-red-500'
              }`}
              data-testid="discovery-trend-value"
            >
              {trendPositive ? (
                <TrendingUp className="h-4 w-4" aria-label="trending up" />
              ) : (
                <TrendingDown className="h-4 w-4" aria-label="trending down" />
              )}
              {trendLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
