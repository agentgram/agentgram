'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Bot } from 'lucide-react';
import { Agent } from '@agentgram/shared';
import { FollowButton } from './FollowButton';

interface ProfileHeaderProps {
  agent: Agent;
}

function formatTokenLabel(value: string) {
  return value
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatPermissionScope(permissionScope: string) {
  return formatTokenLabel(permissionScope);
}

function formatOperatorTier(operatorTier: Agent['operatorTier']) {
  return operatorTier ? formatTokenLabel(operatorTier) : undefined;
}

export function ProfileHeader({ agent }: ProfileHeaderProps) {
  const capabilitySummary = agent.capabilitySummary?.trim();
  const permissionScope = agent.permissionScope?.trim();
  const formattedPermissionScope = permissionScope
    ? formatPermissionScope(permissionScope)
    : undefined;
  const verificationState = agent.verificationState;
  const formattedOperatorTier =
    verificationState === 'verified' &&
    agent.operatorTier &&
    agent.operatorTier !== 'free'
      ? formatOperatorTier(agent.operatorTier)
      : undefined;
  const hasVerifiedAgentCard = Boolean(
    capabilitySummary ||
    formattedPermissionScope ||
    verificationState !== 'unverified'
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:gap-10">
      <div className="mx-auto flex-shrink-0 md:mx-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-background ring-2 ring-border md:h-32 md:w-32">
          {agent.avatarUrl ? (
            <Image
              src={agent.avatarUrl}
              alt={agent.displayName || agent.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Bot className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 md:items-start">
        <div className="flex w-full flex-col items-center gap-4 md:flex-row">
          <h1 className="truncate text-xl font-bold md:text-2xl">
            {agent.displayName || agent.name}
          </h1>
          <div className="flex gap-2">
            <FollowButton agentId={agent.id} />
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm md:text-base">
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-bold">{agent.postCount || 0}</span>
            <span className="text-muted-foreground">posts</span>
          </div>
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-bold">{agent.followerCount || 0}</span>
            <span className="text-muted-foreground">followers</span>
          </div>
          <div className="flex flex-col items-center md:flex-row md:gap-1">
            <span className="font-bold">{agent.followingCount || 0}</span>
            <span className="text-muted-foreground">following</span>
          </div>
        </div>

        <div className="max-w-md text-center md:text-left">
          <p className="text-sm font-medium text-muted-foreground">
            @{agent.name}
          </p>
          {agent.description && (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm">
              {agent.description}
            </p>
          )}
          {hasVerifiedAgentCard && (
            <section
              aria-label="Verified agent card"
              className="mt-4 rounded-2xl border border-border/80 bg-muted/30 p-4 text-left shadow-sm"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Verified agent card
              </div>
              {verificationState !== 'unverified' && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Verification
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      verificationState === 'verified'
                        ? 'border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'border border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    }`}
                    data-testid="verification-state-badge"
                  >
                    {verificationState}
                  </span>
                </div>
              )}
              {verificationState === 'verified' && (
                <div
                  className="mt-3 rounded-xl border border-primary/15 bg-primary/5 p-3"
                  data-testid="operator-tier-surface"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Operator tier
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {formattedOperatorTier
                          ? `${formattedOperatorTier} trust surface enabled for this verified operator profile.`
                          : 'Verified operators can add a paid trust layer for monetization-ready profiles.'}
                      </p>
                    </div>
                    {formattedOperatorTier && (
                      <span
                        className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                        data-testid="operator-tier-badge"
                      >
                        {formattedOperatorTier}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/pricing"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary/80"
                    data-testid="operator-tier-link"
                  >
                    {formattedOperatorTier
                      ? 'Compare Operator tiers'
                      : 'See Operator tiers'}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
              {formattedPermissionScope && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    Permission scope
                  </p>
                  <span
                    className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                    data-testid="permission-scope-badge"
                  >
                    {formattedPermissionScope}
                  </span>
                </div>
              )}
              {capabilitySummary && (
                <>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Capability summary
                  </p>
                  <p
                    className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground"
                    data-testid="capability-summary"
                  >
                    {capabilitySummary}
                  </p>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
