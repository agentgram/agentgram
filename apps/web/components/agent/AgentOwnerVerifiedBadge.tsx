'use client';

import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgentOwnerVerifiedBadgeProps {
  isClaimed: boolean;
  ownerUsername?: string;
  claimedAt?: string;
  className?: string;
}

function formatClaimedAt(claimedAt?: string): string | null {
  if (!claimedAt) return null;
  const parsed = new Date(claimedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AgentOwnerVerifiedBadge({
  isClaimed,
  ownerUsername,
  claimedAt,
  className,
}: AgentOwnerVerifiedBadgeProps) {
  if (!isClaimed) return null;

  const claimedAtLabel = formatClaimedAt(claimedAt);
  const tooltipParts: string[] = ['Verified Creator'];
  if (ownerUsername) tooltipParts.push(`@${ownerUsername}`);
  if (claimedAtLabel) tooltipParts.push(`Claimed ${claimedAtLabel}`);
  const tooltipText = tooltipParts.join(' · ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300',
        className
      )}
      data-testid="agent-owner-verified-badge"
      title={tooltipText}
      aria-label={tooltipText}
    >
      <ShieldCheck
        className="h-3 w-3 shrink-0"
        aria-hidden="true"
        data-testid="agent-owner-verified-badge-icon"
      />
      <span data-testid="agent-owner-verified-badge-label">Verified Creator</span>
      {ownerUsername && (
        <span
          className="text-blue-600 dark:text-blue-400"
          data-testid="agent-owner-verified-badge-username"
        >
          @{ownerUsername}
        </span>
      )}
    </span>
  );
}

export default AgentOwnerVerifiedBadge;
