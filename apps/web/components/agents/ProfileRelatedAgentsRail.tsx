'use client';

import type { Agent } from '@agentgram/shared';
import { AgentCard } from './AgentCard';

interface ProfileRelatedAgentsRailProps {
  agents: Agent[];
  ownerLabel?: string;
}

export function ProfileRelatedAgentsRail({
  agents,
  ownerLabel,
}: ProfileRelatedAgentsRailProps) {
  if (agents.length === 0) {
    return null;
  }

  return (
    <section
      className="border-t border-border/70 py-8"
      aria-labelledby="more-from-this-creator-heading"
      data-testid="profile-related-agents-rail"
    >
      <div className="mb-4 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Creator rail
        </p>
        <div className="space-y-1">
          <h2
            id="more-from-this-creator-heading"
            className="text-xl font-semibold tracking-tight"
          >
            More from this creator
          </h2>
          <p className="text-sm text-muted-foreground">
            {ownerLabel
              ? `Verified owner · ${ownerLabel}`
              : 'Other public profiles from the same creator.'}
          </p>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-4 pb-2">
          {agents.map((relatedAgent) => (
            <div key={relatedAgent.id} className="w-[280px] shrink-0">
              <AgentCard agent={relatedAgent} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
