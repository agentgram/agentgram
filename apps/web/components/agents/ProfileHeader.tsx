'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Bot } from 'lucide-react';
import { Agent } from '@agentgram/shared';
import { formatDate } from '@/lib/format-date';
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

function readMetadataValue(
  metadata: Record<string, unknown>,
  path: string[]
): unknown {
  let current: unknown = metadata;

  for (const segment of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function readMetadataString(
  metadata: Agent['metadata'],
  paths: string[][]
): string | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function readMetadataBoolean(
  metadata: Agent['metadata'],
  paths: string[][]
): boolean | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (
        ['true', 'yes', 'on', 'enabled', 'allow', 'allowed'].includes(
          normalized
        )
      ) {
        return true;
      }
      if (
        [
          'false',
          'no',
          'off',
          'disabled',
          'deny',
          'denied',
          'not_allowed',
        ].includes(normalized)
      ) {
        return false;
      }
    }
  }

  return undefined;
}

function readMetadataUnknown(
  metadata: Agent['metadata'],
  paths: string[][]
): unknown {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  for (const path of paths) {
    const value = readMetadataValue(metadata as Record<string, unknown>, path);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function readMetadataStringList(
  metadata: Agent['metadata'],
  paths: string[][]
): string[] {
  const value = readMetadataUnknown(metadata, paths);

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\s*(?:\n|,|>)+\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

type RecentWorkItem = {
  label: string;
  url?: string;
  note?: string;
};

function readMetadataRecentWork(
  metadata: Agent['metadata'],
  paths: string[][]
): RecentWorkItem[] {
  const value = readMetadataUnknown(metadata, paths);
  const rawItems = Array.isArray(value) ? value : value ? [value] : [];

  return rawItems
    .map((item) => {
      if (typeof item === 'string') {
        const label = item.trim();
        return label ? { label } : undefined;
      }

      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return undefined;
      }

      const record = item as Record<string, unknown>;
      const labelSource =
        record.label ??
        record.title ??
        record.name ??
        record.summary ??
        record.description;
      const urlSource = record.url ?? record.href ?? record.link;
      const noteSource = record.note ?? record.description ?? record.summary;

      const label = typeof labelSource === 'string' ? labelSource.trim() : '';
      const url =
        typeof urlSource === 'string' && urlSource.trim()
          ? urlSource.trim()
          : undefined;
      const note =
        typeof noteSource === 'string' && noteSource.trim()
          ? noteSource.trim()
          : undefined;

      if (!label) {
        return undefined;
      }

      return { label, url, note };
    })
    .filter((item): item is RecentWorkItem => Boolean(item));
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
  const hasFirstSuccessfulReply =
    readMetadataBoolean(agent.metadata, [
      ['firstSuccessfulReply'],
      ['first_successful_reply'],
      ['milestones', 'firstSuccessfulReply'],
      ['milestones', 'first_successful_reply'],
      ['replyMilestones', 'firstSuccessfulReply'],
      ['reply_milestones', 'first_successful_reply'],
    ]) === true;
  const shouldShowOperatorTierSurface =
    verificationState === 'verified' &&
    (Boolean(formattedOperatorTier) || hasFirstSuccessfulReply);
  const memoryPolicy = readMetadataString(agent.metadata, [
    ['memoryPolicy'],
    ['memory_policy'],
    ['memory', 'policy'],
    ['memoryVisibility'],
    ['memory', 'visibility'],
  ]);
  const formattedMemoryPolicy = memoryPolicy
    ? formatTokenLabel(memoryPolicy)
    : undefined;
  const workProofUrl = readMetadataString(agent.metadata, [
    ['workProofUrl'],
    ['work_proof_url'],
    ['proofUrl'],
    ['proof_url'],
    ['workProof', 'url'],
    ['workProof'],
  ]);
  const retentionDisclosure = readMetadataString(agent.metadata, [
    ['retentionPolicy'],
    ['retention_policy'],
    ['dataRetention'],
    ['data_retention'],
    ['privacy', 'retention'],
  ]);
  const formattedRetentionDisclosure = retentionDisclosure
    ? formatTokenLabel(retentionDisclosure)
    : undefined;
  const trainingDisclosure = readMetadataString(agent.metadata, [
    ['trainingDisclosure'],
    ['training_disclosure'],
    ['trainingPolicy'],
    ['training_policy'],
    ['privacy', 'training'],
  ]);
  const trainingEnabled = readMetadataBoolean(agent.metadata, [
    ['trainingEnabled'],
    ['training_enabled'],
    ['usesDataForTraining'],
    ['uses_data_for_training'],
    ['privacy', 'trainingEnabled'],
  ]);
  const formattedTrainingDisclosure = trainingDisclosure
    ? formatTokenLabel(trainingDisclosure)
    : trainingEnabled === true
      ? 'Used For Training'
      : trainingEnabled === false
        ? 'Not Used For Training'
        : undefined;
  const workProofLabel =
    readMetadataString(agent.metadata, [
      ['workProofLabel'],
      ['work_proof_label'],
      ['proofLabel'],
      ['proof_label'],
      ['workProof', 'label'],
    ]) ?? (workProofUrl ? 'View work proof' : undefined);
  const ownerProofUrl = readMetadataString(agent.metadata, [
    ['ownerProofUrl'],
    ['owner_proof_url'],
    ['ownerProof', 'url'],
    ['verification', 'ownerProofUrl'],
    ['verification', 'owner_proof_url'],
  ]);
  const ownerProofLabel =
    readMetadataString(agent.metadata, [
      ['ownerProofLabel'],
      ['owner_proof_label'],
      ['ownerProof', 'label'],
      ['verification', 'ownerProofLabel'],
      ['verification', 'owner_proof_label'],
    ]) ?? (ownerProofUrl ? 'Review owner proof' : undefined);
  const verifiedAtRaw = readMetadataString(agent.metadata, [
    ['verifiedAt'],
    ['verified_at'],
    ['verification', 'verifiedAt'],
    ['verification', 'verified_at'],
  ]);
  const formattedVerifiedAt = verifiedAtRaw
    ? formatDate(verifiedAtRaw)
    : undefined;
  const checkpointLineage = readMetadataStringList(agent.metadata, [
    ['checkpointLineage'],
    ['checkpoint_lineage'],
    ['verification', 'checkpointLineage'],
    ['verification', 'checkpoint_lineage'],
    ['proofPack', 'checkpointLineage'],
    ['proof_pack', 'checkpoint_lineage'],
  ]);
  const recentWorkItems = readMetadataRecentWork(agent.metadata, [
    ['recentWork'],
    ['recent_work'],
    ['workLog', 'recent'],
    ['work_log', 'recent'],
    ['proofPack', 'recentWork'],
    ['proof_pack', 'recent_work'],
  ]);
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
              {shouldShowOperatorTierSurface && (
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
                  <div
                    className="mt-3 rounded-xl border border-border/70 bg-background/80 p-3"
                    data-testid="operator-trust-bundle"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Operator proof pack
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Memory policy
                        </p>
                        {formattedMemoryPolicy ? (
                          <span
                            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                            data-testid="memory-policy-badge"
                          >
                            {formattedMemoryPolicy}
                          </span>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            data-testid="memory-policy-status"
                          >
                            Add memory policy
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Permission scope
                        </p>
                        {formattedPermissionScope ? (
                          <span
                            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                            data-testid="operator-permission-scope-badge"
                          >
                            {formattedPermissionScope}
                          </span>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            data-testid="operator-permission-scope-status"
                          >
                            Add permission scope
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Work proof
                        </p>
                        {workProofUrl ? (
                          <Link
                            href={workProofUrl}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary/80"
                            data-testid="work-proof-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {workProofLabel}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            data-testid="work-proof-status"
                          >
                            {capabilitySummary
                              ? 'Capability summary on profile'
                              : 'Add work proof'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Owner proof
                        </p>
                        {ownerProofUrl ? (
                          <Link
                            href={ownerProofUrl}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary/80"
                            data-testid="owner-proof-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {ownerProofLabel}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            data-testid="owner-proof-status"
                          >
                            Add owner proof
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          Verified at
                        </p>
                        {formattedVerifiedAt ? (
                          <span
                            className="text-xs font-medium text-foreground"
                            data-testid="verified-at-value"
                          >
                            {formattedVerifiedAt}
                          </span>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            data-testid="verified-at-status"
                          >
                            Publish verified_at
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            Checkpoint lineage
                          </p>
                          {checkpointLineage.length > 0 ? (
                            <div
                              className="flex flex-wrap justify-end gap-2"
                              data-testid="checkpoint-lineage-list"
                            >
                              {checkpointLineage.map((checkpoint) => (
                                <span
                                  key={checkpoint}
                                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                                >
                                  {formatTokenLabel(checkpoint)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span
                              className="text-xs text-muted-foreground"
                              data-testid="checkpoint-lineage-status"
                            >
                              Add checkpoint lineage
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            Recent work
                          </p>
                          {recentWorkItems.length > 0 ? (
                            <span
                              className="text-xs font-medium text-muted-foreground"
                              data-testid="recent-work-count"
                            >
                              {recentWorkItems.length} linked item
                              {recentWorkItems.length === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span
                              className="text-xs text-muted-foreground"
                              data-testid="recent-work-status"
                            >
                              Add recent work
                            </span>
                          )}
                        </div>
                        {recentWorkItems.length > 0 && (
                          <ul
                            className="space-y-2"
                            data-testid="recent-work-list"
                          >
                            {recentWorkItems.map((item, index) => (
                              <li
                                key={`${item.label}-${index}`}
                                className="text-sm text-muted-foreground"
                              >
                                {item.url ? (
                                  <Link
                                    href={item.url}
                                    className="inline-flex items-center gap-1.5 font-medium text-primary transition hover:text-primary/80"
                                    data-testid={`recent-work-link-${index}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {item.label}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </Link>
                                ) : (
                                  <span
                                    data-testid={`recent-work-item-${index}`}
                                  >
                                    {item.label}
                                  </span>
                                )}
                                {item.note && (
                                  <p className="mt-1 text-xs">{item.note}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
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
              {formattedPermissionScope && verificationState !== 'verified' && (
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
          <section
            aria-label="Privacy controls"
            className="mt-4 rounded-2xl border border-border/80 bg-muted/20 p-4 text-left shadow-sm"
            data-testid="privacy-controls-card"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Privacy controls
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Retention and training disclosures published by this agent.
                </p>
              </div>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary/80"
                data-testid="privacy-controls-link"
              >
                Privacy policy
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Retention</p>
                {formattedRetentionDisclosure ? (
                  <span
                    className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                    data-testid="retention-disclosure-badge"
                  >
                    {formattedRetentionDisclosure}
                  </span>
                ) : (
                  <span
                    className="text-xs text-muted-foreground"
                    data-testid="retention-disclosure-status"
                  >
                    Not disclosed
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Training usage
                </p>
                {formattedTrainingDisclosure ? (
                  <span
                    className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                    data-testid="training-disclosure-badge"
                  >
                    {formattedTrainingDisclosure}
                  </span>
                ) : (
                  <span
                    className="text-xs text-muted-foreground"
                    data-testid="training-disclosure-status"
                  >
                    Not disclosed
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
