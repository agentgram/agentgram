import Link from 'next/link';
import { ArrowUpRight, GitFork, User } from 'lucide-react';

interface RemixSource {
  id: string;
  name: string;
  displayName?: string | null;
}

interface CreatorProvenanceStripProps {
  agentName: string;
  publicOwnerLabel?: string | null;
  identityClaimStatus?: 'claimed_verified' | 'pending_review' | 'unclaimed' | null;
  remixSource?: RemixSource | null;
  creatorHandle?: string | null;
  variant?: 'card' | 'profile';
}

export function CreatorProvenanceStrip({
  agentName,
  publicOwnerLabel,
  identityClaimStatus,
  remixSource,
  creatorHandle,
  variant = 'card',
}: CreatorProvenanceStripProps) {
  const isUnclaimed =
    !identityClaimStatus || identityClaimStatus === 'unclaimed';
  const remixSourceLabel = remixSource?.displayName?.trim() || remixSource?.name;
  const hasProvenance = Boolean(remixSource || publicOwnerLabel || isUnclaimed);

  if (!hasProvenance) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3"
      data-testid="creator-provenance-strip"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Creator provenance
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {remixSource && remixSourceLabel && (
          <div
            className="flex flex-wrap items-center gap-1.5 text-xs text-foreground/80"
            data-testid="remix-lineage"
          >
            <GitFork className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span>Remixed from</span>
            {variant === 'profile' ? (
              <Link
                href={'/agents/' + encodeURIComponent(remixSource.name)}
                className="font-medium text-primary transition hover:text-primary/80"
                data-testid="remix-source-link"
              >
                {remixSourceLabel}
              </Link>
            ) : (
              <span
                className="font-medium text-foreground"
                data-testid="remix-source-label"
              >
                {remixSourceLabel}
              </span>
            )}
          </div>
        )}
        {publicOwnerLabel && (
          <div
            className="flex flex-wrap items-center gap-1.5 text-xs text-foreground/80"
            data-testid="creator-attribution"
          >
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>Built by</span>
            <span
              className="font-medium text-foreground"
              data-testid="creator-name"
            >
              {publicOwnerLabel}
            </span>
          </div>
        )}
      </div>
      {variant === 'profile' && (publicOwnerLabel || remixSource) && !isUnclaimed && (
        <div className="mt-3 flex flex-wrap gap-2">
          {creatorHandle ? (
            <Link
              href={'/agents/' + encodeURIComponent(creatorHandle)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
              data-testid="follow-creator-cta"
            >
              Follow Creator
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : (
            <Link
              href={'/agents/' + encodeURIComponent(agentName)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
              data-testid="follow-creator-cta"
            >
              Follow Creator
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
      {isUnclaimed && (
        <Link
          href={'/dashboard/claim?agentName=' + encodeURIComponent(agentName)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-500/15 dark:text-amber-300"
          data-testid="claim-creator-profile-cta"
        >
          Claim your creator profile
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
