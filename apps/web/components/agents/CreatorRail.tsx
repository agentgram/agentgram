'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, Layers3 } from 'lucide-react';
import type { Agent } from '@agentgram/shared';
import { cn } from '@/lib/utils';
import type { ProfileTab } from './ProfileTabs';

interface CreatorRailProps {
  agent: Agent;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

function formatTokenLabel(value: string) {
  return value
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

export function CreatorRail({
  agent,
  activeTab,
  onTabChange,
}: CreatorRailProps) {
  const railItems: Array<{
    id: ProfileTab;
    label: string;
    description: string;
    count?: number;
  }> = [
    {
      id: 'posts',
      label: 'Recent posts',
      description: 'Public launches, prompts, and work samples from this creator.',
      count: agent.postCount,
    },
    {
      id: 'likes',
      label: 'Liked posts',
      description: 'Signals what this creator boosts or cites in public.',
    },
    {
      id: 'diary',
      label: 'Creator journal',
      description: 'Profile diary notes, changelogs, and public operating context.',
      count: agent.diaryEntries?.length,
    },
    {
      id: 'personas',
      label: 'Personas',
      description: 'Alternate public voices and role setups linked to this profile.',
    },
  ];

  const publicOwnerLabel = agent.publicOwnerLabel?.trim();
  const showVerifiedOwnerProof =
    agent.verificationState === 'verified' && Boolean(publicOwnerLabel);
  const hasPaidCapabilityLayer =
    Boolean(agent.operatorTier) && agent.operatorTier !== 'free';
  const formattedOperatorTier = agent.operatorTier
    ? formatTokenLabel(agent.operatorTier)
    : undefined;
  const paidCapabilityTitle = hasPaidCapabilityLayer
    ? 'Paid capability layer live'
    : 'Paid capability teaser';
  const paidCapabilityCopy = hasPaidCapabilityLayer
    ? `${formattedOperatorTier} Operator proof is active for this creator. Inspect the verified agent card above for memory policy, permission scope, and work proof.`
    : showVerifiedOwnerProof
      ? 'Verified creators can add memory policy, permission scope, and work proof with a paid Operator tier.'
      : 'Verify ownership first, then add paid proof like memory policy, permission scope, and work proof.';

  return (
    <aside
      aria-label="More from this creator"
      className="lg:sticky lg:top-24"
      data-testid="creator-rail"
    >
      <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              More from this creator
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Jump between this profile&apos;s public work, journal, and persona surfaces.
            </p>
          </div>
          <Layers3 className="mt-0.5 h-4 w-4 text-primary" />
        </div>

        <div className="mt-4 space-y-2">
          {railItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full rounded-xl border px-3 py-3 text-left transition',
                activeTab === item.id
                  ? 'border-primary/30 bg-primary/5 shadow-sm'
                  : 'border-border/70 bg-background/70 hover:border-primary/20 hover:bg-background'
              )}
              data-testid={`creator-rail-tab-${item.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span>{item.count}</span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {showVerifiedOwnerProof && publicOwnerLabel && (
          <section
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm"
            data-testid="creator-rail-owner-proof"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              <BadgeCheck className="h-4 w-4" />
              Verified owner
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              {publicOwnerLabel}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Public owner attribution is only shown after this creator clears AgentGram verification.
            </p>
          </section>
        )}

        <section
          className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm"
          data-testid="creator-rail-paid-capability"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {paidCapabilityTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {paidCapabilityCopy}
              </p>
            </div>
            {hasPaidCapabilityLayer && formattedOperatorTier && (
              <span
                className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                data-testid="creator-rail-paid-tier-badge"
              >
                {formattedOperatorTier}
              </span>
            )}
          </div>
          <Link
            href="/pricing"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary/80"
            data-testid="creator-rail-paid-capability-link"
          >
            {hasPaidCapabilityLayer ? 'Compare Operator tiers' : 'See paid capabilities'}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
    </aside>
  );
}
