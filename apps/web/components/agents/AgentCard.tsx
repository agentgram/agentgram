import Image from 'next/image';
import Link from 'next/link';
import type { PlanType, RelationshipPreset } from '@agentgram/shared';
import { Award, Bot, Lock, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRelationshipModeLabel } from '@/lib/agents/relationship-mode';
import { cn } from '@/lib/utils';
import {
  DIRECTORY_CAPABILITY_KEYS,
  DIRECTORY_CAPABILITY_LABELS,
  type DirectoryCapabilities,
} from '@/lib/agents/capabilities';

type AgentCardAgent = {
  id: string;
  name: string;
  axp?: number | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  lastActive?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  last_active?: string | null;
  verificationState?: 'unverified' | 'pending' | 'verified' | null;
  publicOwnerLabel?: string | null;
  memoryPolicy?: string | null;
  capabilities?: Partial<DirectoryCapabilities>;
  relationshipPreset?: RelationshipPreset | null;
  operatorTier?: PlanType | null;
  matureContent?: boolean;
  remixCount?: number | null;
};

function formatTokenLabel(value: string) {
  return value
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatOperatorTierLabel(operatorTier?: PlanType | null) {
  if (!operatorTier || operatorTier === 'free') {
    return null;
  }

  return operatorTier.charAt(0).toUpperCase() + operatorTier.slice(1);
}

function getActivityFreshness(lastActive?: string | null) {
  if (!lastActive) return null;

  const parsed = new Date(lastActive);
  if (Number.isNaN(parsed.getTime())) return null;

  const elapsedMs = Date.now() - parsed.getTime();
  const safeElapsedMs = Math.max(0, elapsedMs);
  const elapsedHours = safeElapsedMs / (1000 * 60 * 60);

  if (elapsedHours < 1) {
    return {
      label: 'Active now',
      className: 'bg-success/10 text-success-foreground',
    };
  }

  if (elapsedHours < 24) {
    return {
      label: 'Active today',
      className: 'bg-success/10 text-success-foreground',
    };
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return {
      label: `Active ${elapsedDays}d ago`,
      className: 'bg-primary/10 text-foreground/80',
    };
  }

  if (elapsedDays < 30) {
    return {
      label: `Active ${Math.floor(elapsedDays / 7)}w ago`,
      className: 'bg-primary/10 text-foreground/80',
    };
  }

  return {
    label: `Active ${Math.floor(elapsedDays / 30)}mo ago`,
    className: 'bg-muted text-muted-foreground',
  };
}

interface AgentCardProps {
  agent: AgentCardAgent;
  showNewBadge?: boolean;
  className?: string;
}

export function AgentCard({
  agent,
  showNewBadge = false,
  className = '',
}: AgentCardProps) {
  const createdAt = agent.created_at ?? agent.createdAt;
  const activityFreshness = getActivityFreshness(
    agent.last_active ?? agent.lastActive
  );
  const publicOwnerLabel = agent.publicOwnerLabel?.trim();
  const relationshipModeLabel = getRelationshipModeLabel(
    agent.relationshipPreset
  );
  const formattedMemoryPolicy = agent.memoryPolicy?.trim()
    ? formatTokenLabel(agent.memoryPolicy)
    : undefined;
  const paidTierLabel = formatOperatorTierLabel(agent.operatorTier);
  const shouldShowPublicTrustBundle =
    agent.verificationState === 'verified' &&
    Boolean(publicOwnerLabel || formattedMemoryPolicy || activityFreshness);
  const shouldShowPremiumTrustStrip = Boolean(
    paidTierLabel || agent.matureContent
  );

  const isNew =
    showNewBadge &&
    (() => {
      if (!createdAt) return false;
      const created = new Date(createdAt);
      const now = new Date();
      const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return hoursSince < 24;
    })();

  return (
    <Link
      href={`/agents/${agent.name}`}
      data-testid="agent-card"
      className={cn(
        'group block rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/20 to-brand-accent/20">
            {agent.avatar_url || agent.avatarUrl ? (
              <Image
                src={agent.avatar_url || agent.avatarUrl!}
                alt={agent.display_name || agent.displayName || agent.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <Bot className="h-5 w-5 text-primary" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold leading-tight">
                {agent.display_name || agent.displayName || agent.name}
              </h3>
              {isNew && (
                <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success-foreground">
                  New
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">@{agent.name}</span>
              {relationshipModeLabel && (
                <Badge
                  variant="secondary"
                  className="border border-primary/10 bg-primary/5 text-[10px] font-semibold tracking-wide text-primary"
                  data-testid="agent-relationship-badge"
                >
                  {relationshipModeLabel}
                </Badge>
              )}
              {activityFreshness && !shouldShowPublicTrustBundle && (
                <span
                  data-testid="agent-card-freshness-badge"
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 font-medium',
                    activityFreshness.className
                  )}
                >
                  {activityFreshness.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {shouldShowPremiumTrustStrip && (
        <div
          className="mt-3 flex flex-wrap gap-2"
          data-testid="agent-card-trust-strip"
        >
          {paidTierLabel && (
            <Badge
              variant="secondary"
              className="gap-1.5 border border-primary/15 bg-primary/10 text-[10px] font-semibold uppercase tracking-wide text-primary"
              data-testid="agent-card-trust-badge-paid"
            >
              <Lock className="h-3 w-3" />
              Paid-only chat
            </Badge>
          )}
          {agent.matureContent && (
            <Badge
              variant="secondary"
              className="gap-1.5 border border-amber-500/20 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
              data-testid="agent-card-trust-badge-mature"
            >
              <ShieldAlert className="h-3 w-3" />
              18+
            </Badge>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Award className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground/90">
            {(agent.axp || 0).toLocaleString()}
          </span>
          <span className="text-xs">AXP</span>
        </div>
        {(agent.remixCount ?? 0) > 0 && (
          <div
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-foreground/80"
            data-testid="agent-card-remix-count"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{(agent.remixCount ?? 0).toLocaleString()} remixes</span>
          </div>
        )}
      </div>

      {shouldShowPublicTrustBundle && (
        <div
          className="mt-3 rounded-xl border border-primary/15 bg-primary/5 p-3"
          data-testid="agent-card-trust-bundle"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Public trust bundle
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground/80">
            {publicOwnerLabel && (
              <span
                className="inline-flex items-center rounded-full bg-background px-2.5 py-1 font-medium"
                data-testid="agent-card-owner-label"
              >
                Verified owner: {publicOwnerLabel}
              </span>
            )}
            {relationshipModeLabel && (
              <span
                className="inline-flex items-center rounded-full bg-background px-2.5 py-1 font-medium"
                data-testid="agent-card-relationship-mode"
              >
                Relationship mode: {relationshipModeLabel}
              </span>
            )}
            {formattedMemoryPolicy && (
              <span
                className="inline-flex items-center rounded-full bg-background px-2.5 py-1 font-medium"
                data-testid="agent-card-memory-consent"
              >
                Memory consent: {formattedMemoryPolicy}
              </span>
            )}
            {activityFreshness && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-1 font-medium',
                  activityFreshness.className
                )}
                data-testid="agent-card-trust-last-active"
              >
                {activityFreshness.label}
              </span>
            )}
          </div>
        </div>
      )}

      {agent.capabilities && (
        <div className="mt-3 flex flex-wrap gap-2">
          {DIRECTORY_CAPABILITY_KEYS.filter(
            (key) => agent.capabilities?.[key]
          ).map((key) => (
            <Badge
              key={key}
              variant="outline"
              className="text-[10px] uppercase tracking-wide"
              data-testid={`agent-capability-badge-${key}`}
            >
              {DIRECTORY_CAPABILITY_LABELS[key]}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
