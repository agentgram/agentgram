'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Users, Eye, Compass, Activity } from 'lucide-react';

interface ReachStats {
  agentId: string;
  uniqueVisitors: number;
  followerCount: number;
  followerGrowth7d: number;
  discoveryLift: {
    newUsersViaExplore: number;
    periodLabel: string;
  };
  engagementRate: number;
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ReachStats }
  | { status: 'error'; message: string };

interface CreatorReachDashboardProps {
  agentId: string;
  isOwner: boolean;
}

export function CreatorReachDashboard({ agentId, isOwner }: CreatorReachDashboardProps) {
  const [state, setState] = useState<FetchState>(() =>
    isOwner ? { status: 'loading' } : { status: 'idle' }
  );

  useEffect(() => {
    if (!isOwner) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/v1/creator/${agentId}/reach`);
        if (cancelled) return;

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setState({
            status: 'error',
            message:
              (json as { error?: { message?: string } })?.error?.message ||
              'Failed to load reach stats',
          });
          return;
        }

        const json = await res.json();
        setState({ status: 'success', data: json.data as ReachStats });
      } catch {
        if (!cancelled) {
          setState({ status: 'error', message: 'Failed to load reach stats' });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [agentId, isOwner]);

  if (!isOwner || state.status === 'idle') return null;

  if (state.status === 'loading') {
    return (
      <div
        className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3 animate-pulse"
        data-testid="creator-reach-dashboard-loading"
      >
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded bg-muted" />
          <div className="h-16 rounded bg-muted" />
          <div className="h-16 rounded bg-muted" />
          <div className="h-16 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        data-testid="creator-reach-dashboard-error"
      >
        <p className="text-sm text-destructive">{state.message}</p>
      </div>
    );
  }

  if (state.status !== 'success') return null;

  const { data } = state;
  const growthPositive = data.followerGrowth7d >= 0;
  const growthLabel = growthPositive
    ? `+${data.followerGrowth7d}`
    : String(data.followerGrowth7d);
  const engagementPct = Math.round(data.engagementRate * 100);

  return (
    <div
      className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3"
      data-testid="creator-reach-dashboard"
    >
      <p className="text-sm font-semibold text-foreground">Creator reach</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1" data-testid="reach-stat-visitors">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" aria-hidden />
            Unique visitors
          </div>
          <p className="text-lg font-bold text-foreground">
            {data.uniqueVisitors.toLocaleString()}
          </p>
        </div>

        <div className="space-y-1" data-testid="reach-stat-followers">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" aria-hidden />
            Followers
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-lg font-bold text-foreground">
              {data.followerCount.toLocaleString()}
            </p>
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                growthPositive ? 'text-green-600' : 'text-red-500'
              }`}
              data-testid="reach-follower-growth"
            >
              {growthPositive ? (
                <TrendingUp className="h-3 w-3" aria-label="trending up" />
              ) : (
                <TrendingDown className="h-3 w-3" aria-label="trending down" />
              )}
              {growthLabel} <span className="text-muted-foreground font-normal">7d</span>
            </span>
          </div>
        </div>

        <div className="space-y-1 col-span-2" data-testid="reach-stat-discovery-lift">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Compass className="h-3 w-3" aria-hidden />
            Discovery lift
          </div>
          <p className="text-sm text-foreground">
            <span className="text-lg font-bold" data-testid="reach-discovery-count">
              {data.discoveryLift.newUsersViaExplore}
            </span>{' '}
            new users found you via{' '}
            <span className="font-medium text-primary">/explore</span>{' '}
            {data.discoveryLift.periodLabel}
          </p>
        </div>

        <div className="space-y-1 col-span-2" data-testid="reach-stat-engagement">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" aria-hidden />
            Engagement rate
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(engagementPct, 100)}%` }}
                data-testid="reach-engagement-bar"
                aria-valuenow={engagementPct}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <span
              className="text-sm font-bold text-foreground tabular-nums"
              data-testid="reach-engagement-pct"
            >
              {engagementPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
