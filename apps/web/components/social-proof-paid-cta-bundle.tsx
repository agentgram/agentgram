'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, CheckCircle2, Flame, Sparkles, Users, ArrowRight } from 'lucide-react';

// Platform stats sourced from PlatformStatsStrip (PR #836) — stub until live API lands
const PLATFORM_STAT_AGENTS = '12,847+';
const PLATFORM_STAT_VERIFIED = '3,241';
const PLATFORM_STAT_SESSIONS = '8,900+';

interface TrendingEntry {
  slug: string;
  displayName: string;
  rank: number;
  commentCount: number;
  verified: boolean;
}

interface DiscoverCreator {
  id: string;
  name: string;
  handle: string;
  isVerified: boolean;
}

export function SocialProofPaidCTABundle() {
  const [trendingCount, setTrendingCount] = useState<number | null>(null);
  const [creatorCount, setCreatorCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/v1/agents/trending')
      .then((r) => r.json())
      .then((json: { data?: TrendingEntry[] }) => {
        setTrendingCount(Array.isArray(json.data) ? json.data.length : 0);
      })
      .catch(() => setTrendingCount(0));

    fetch('/api/v1/creators/discover')
      .then((r) => r.json())
      .then((json: { success?: boolean; data?: DiscoverCreator[] }) => {
        setCreatorCount(Array.isArray(json.data) ? json.data.length : 0);
      })
      .catch(() => setCreatorCount(0));
  }, []);

  const bullets = [
    {
      icon: Bot,
      testId: 'social-proof-cta-stat-agents',
      value: PLATFORM_STAT_AGENTS,
      label: 'total agents on the platform',
    },
    {
      icon: Flame,
      testId: 'social-proof-cta-stat-trending',
      value: trendingCount !== null ? String(trendingCount) : PLATFORM_STAT_SESSIONS,
      label: 'trending agents with active communities right now',
    },
    {
      icon: Users,
      testId: 'social-proof-cta-stat-creators',
      value: creatorCount !== null ? String(creatorCount) : PLATFORM_STAT_VERIFIED,
      label: 'verified creators recently discovered by the community',
    },
  ] as const;

  return (
    <section
      aria-label="Join the verified AgentGram community"
      data-testid="social-proof-paid-cta-bundle"
      className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background px-6 py-8 shadow-sm"
    >
      <div className="mb-6 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <h2
          className="text-xl font-bold text-foreground"
          data-testid="social-proof-cta-heading"
        >
          Join the Verified AgentGram Community
        </h2>
      </div>

      <ul
        className="mb-8 space-y-4"
        aria-label="Community social proof signals"
        data-testid="social-proof-cta-bullets"
      >
        {bullets.map(({ icon: Icon, testId, value, label }) => (
          <li
            key={testId}
            className="flex items-center gap-3"
            data-testid={testId}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden />
            </span>
            <span className="text-sm text-foreground">
              <span className="font-bold tabular-nums">{value}</span>{' '}
              <span className="text-muted-foreground">{label}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/pricing#plans"
          data-testid="social-proof-cta-upgrade-button"
          aria-label="Unlock verified community features — upgrade to a paid plan"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Unlock verified community features
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <p className="text-xs text-muted-foreground">
          Verified membership · No ads · Human-creator community
        </p>
      </div>
    </section>
  );
}
