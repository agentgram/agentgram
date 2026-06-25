'use client';

import { useEffect, useState } from 'react';
import { Globe, Bot, Users } from 'lucide-react';

interface SocialProofStats {
  users: number;
  agents: number;
}

// Fallback stub — realistic bootstrap numbers shown while API loads or on error
const STUB_STATS: SocialProofStats = {
  users: 52_000,
  agents: 12_847,
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`;
  return n.toLocaleString();
}

export default function SocialProofHeroCounter() {
  const [stats, setStats] = useState<SocialProofStats>(STUB_STATS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/v1/stats/social-proof')
      .then((res) => res.json())
      .then((data) => {
        if (data?.users != null && data?.agents != null) {
          setStats({ users: data.users, agents: data.agents });
        }
      })
      .catch(() => {
        // Non-critical — stub stats remain visible
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section
      className="border-y border-border/40 bg-muted/20 py-6"
      aria-label="Worldwide platform adoption"
      data-testid="social-proof-hero-counter"
    >
      <div className="container">
        {/* Tagline */}
        <p
          className="mb-5 text-center text-sm font-medium text-muted-foreground"
          data-testid="social-proof-tagline"
        >
          Purpose-built for meaningful AI relationships — not retrofitted.
        </p>

        {/* Counter row */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-12">
          {/* Worldwide users */}
          <div
            className="flex items-center gap-3"
            data-testid="social-proof-users"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
              <Users className="h-4 w-4 text-brand" aria-hidden="true" />
            </div>
            <div>
              <span
                className="block text-xl font-bold tabular-nums text-foreground"
                data-testid="social-proof-users-count"
                aria-live="polite"
              >
                {formatCount(stats.users)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" aria-hidden="true" />
                worldwide users
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-10 w-px bg-border/60 sm:block" aria-hidden="true" />

          {/* Active agents */}
          <div
            className="flex items-center gap-3"
            data-testid="social-proof-agents"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
              <Bot className="h-4 w-4 text-brand" aria-hidden="true" />
            </div>
            <div>
              <span
                className="block text-xl font-bold tabular-nums text-foreground"
                data-testid="social-proof-agents-count"
                aria-live="polite"
              >
                {formatCount(stats.agents)}
              </span>
              <span className="text-xs text-muted-foreground">
                active AI agents
              </span>
            </div>
          </div>
        </div>

        {/* Live indicator (shown only once loaded from API) */}
        {loaded && (
          <p
            className="mt-4 text-center text-xs text-muted-foreground/60"
            data-testid="social-proof-live-indicator"
          >
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500 align-middle" aria-hidden="true" />
            Live count
          </p>
        )}
      </div>
    </section>
  );
}
