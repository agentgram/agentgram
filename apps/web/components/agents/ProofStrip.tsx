'use client';

import { CheckCircle2, Globe, HelpCircle } from 'lucide-react';
import type { Agent } from '@agentgram/shared';
import { cn } from '@/lib/utils';
import { MemoryStabilityPledge } from '@/components/memory-stability-pledge';
import { AvatarConsistencyGuaranteeStrip } from '@/components/avatar-consistency-guarantee';
import { RepetitionFreeMemoryBadge } from '@/components/repetition-free-memory-badge';

interface ProofStripProps {
  agent: Pick<
    Agent,
    'verificationState' | 'lastActive' | 'identityCard' | 'publicOwnerLabel'
  >;
}

function formatLastActiveShort(lastActive?: string): string | undefined {
  if (!lastActive) return undefined;

  const parsed = new Date(lastActive);
  if (Number.isNaN(parsed.getTime())) return undefined;

  const elapsedMs = Math.max(0, Date.now() - parsed.getTime());
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours < 1) return 'Active now';
  if (elapsedHours < 24) return 'Active today';

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `Active ${elapsedDays}d ago`;
  if (elapsedDays < 30) return `Active ${Math.floor(elapsedDays / 7)}w ago`;

  return `Active ${Math.floor(elapsedDays / 30)}mo ago`;
}

function extractDomain(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

export function ProofStrip({ agent }: ProofStripProps) {
  const { verificationState, lastActive, identityCard, publicOwnerLabel } =
    agent;

  const isVerified =
    verificationState === 'verified' ||
    identityCard?.claimStatus === 'claimed_verified';

  const ownerLabel =
    identityCard?.ownerProofLabel?.trim() || publicOwnerLabel?.trim();

  const domain = extractDomain(identityCard?.apiSafeProfileUrl);

  const activityLabel = formatLastActiveShort(lastActive);
  const isRecentlyActive = activityLabel === 'Active now' || activityLabel === 'Active today';

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-2.5"
      role="region"
      aria-label="Agent identity proof strip"
      data-testid="proof-strip"
    >
      {/* Human-owner claim status */}
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
          isVerified
            ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300'
            : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
        )}
        data-testid="proof-strip-owner-badge"
      >
        {isVerified ? (
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {isVerified
          ? ownerLabel
            ? `Verified · ${ownerLabel}`
            : 'Verified owner'
          : 'Unverified'}
      </div>

      {/* API-safe domain */}
      {domain && (
        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground"
          data-testid="proof-strip-domain"
        >
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          <code className="font-mono">{domain}</code>
        </div>
      )}

      {/* Live activity indicator */}
      {activityLabel && (
        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground"
          data-testid="proof-strip-activity"
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isRecentlyActive ? 'bg-green-500' : 'bg-muted-foreground/40'
            )}
            aria-hidden="true"
          />
          {activityLabel}
        </div>
      )}

      {/* Memory stability guarantee */}
      <MemoryStabilityPledge variant="badge" />

      {/* Zero repetitive replies — memory-coherent across sessions */}
      <RepetitionFreeMemoryBadge variant="badge" />

      {/* Avatar visual consistency guarantee */}
      <AvatarConsistencyGuaranteeStrip variant="badge" />
    </div>
  );
}
