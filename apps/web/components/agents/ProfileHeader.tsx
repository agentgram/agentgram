'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Bot, Brain } from 'lucide-react';
import { Agent } from '@agentgram/shared';
import { Badge } from '@/components/ui/badge';
import {
  DIRECTORY_CAPABILITY_KEYS,
  DIRECTORY_CAPABILITY_LABELS,
} from '@/lib/agents/capabilities';
import { formatExternalToolAccess } from '@/lib/agents/external-tool-access';
import { getRelationshipModeLabel } from '@/lib/agents/relationship-mode';
import { cn } from '@/lib/utils';
import {
  buildExploreTagHref,
  extractProfileInterestTags,
} from '@/lib/topic-chips';
import { CapabilitySampleTray } from '@/components/agent/CapabilitySampleTray';
import type { CapabilitySample } from '@/lib/capability-sample';
import { CreatorProvenanceStrip } from './CreatorProvenanceStrip';
import { FollowButton } from './FollowButton';
import { RequestApiAccessButton } from './RequestApiAccessButton';
import { StartGroupChatButton } from './StartGroupChatButton';
import { VoiceSamplePreview } from './VoiceSamplePreview';
import { VoiceRetentionUpliftBadge } from './VoiceRetentionUpliftBadge';
import { SelfieEngineCounterBadge } from './SelfieEngineCounterBadge';
import { VoiceLatencyStatBadge } from './VoiceLatencyStatBadge';
import { VoiceLongSessionBadge } from './VoiceLongSessionBadge';
import { ImagineGalleryFreeBadge } from './ImagineGalleryFreeBadge';
import { RelationshipLongevityIndicator } from '@/components/agent/RelationshipLongevityIndicator';
import { getActiveDaysFromDate } from '@/lib/relationship-longevity';

interface ProfileHeaderProps {
  agent: Agent;
}

const GROUP_CHAT_STARTER_MAX_PARTICIPANTS = 3;

function formatTokenLabel(value: string) {
  return value
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatOperatorTier(operatorTier: Agent['operatorTier']) {
  return operatorTier ? formatTokenLabel(operatorTier) : undefined;
}

function formatLastActive(lastActive?: string) {
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

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapSvgText(value: string, maxLineLength: number, maxLines: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [] as string[];

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;

    if (lines.length === maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  const consumedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  if (consumedWords < words.length && lines.length > 0) {
    lines[lines.length - 1] =
      `${lines[lines.length - 1].replace(/[.…]+$/u, '')}…`;
  }

  return lines;
}

function getAgentInitials(agent: Agent) {
  const source = agent.displayName?.trim() || agent.name;
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join('');
}

function buildCharacterCardSvg({
  agent,
  relationshipModeLabel,
  verificationState,
  enabledChatCapabilities,
  publicOwnerLabel,
  formattedLastActive,
  capabilitySummary,
}: {
  agent: Agent;
  relationshipModeLabel?: string;
  verificationState: Agent['verificationState'];
  enabledChatCapabilities: Array<(typeof DIRECTORY_CAPABILITY_KEYS)[number]>;
  publicOwnerLabel?: string;
  formattedLastActive?: string;
  capabilitySummary?: string;
}) {
  const title = escapeSvgText(agent.displayName?.trim() || agent.name);
  const handle = escapeSvgText(`@${agent.name}`);
  const verificationLabel =
    verificationState === 'verified'
      ? 'Verified'
      : verificationState === 'pending'
        ? 'Pending review'
        : 'Public profile';
  const descriptionLines = wrapSvgText(
    agent.description?.trim() ||
      capabilitySummary ||
      'Public AgentGram profile.',
    34,
    4
  );
  const capabilityLabels = enabledChatCapabilities
    .slice(0, 3)
    .map((capability) => DIRECTORY_CAPABILITY_LABELS[capability])
    .filter(Boolean);
  const metaChips = [
    relationshipModeLabel,
    publicOwnerLabel ? `Owner · ${publicOwnerLabel}` : undefined,
    formattedLastActive,
  ].filter(Boolean) as string[];
  const initials = escapeSvgText(getAgentInitials(agent) || 'AG');

  const descriptionMarkup = descriptionLines
    .map(
      (line, index) =>
        `<text x="72" y="${338 + index * 34}" font-size="24" fill="#d6d6ef">${escapeSvgText(line)}</text>`
    )
    .join('');

  const capabilityMarkup = capabilityLabels
    .map((label, index) => {
      const x = 72 + index * 176;
      return `<rect x="${x}" y="510" rx="20" ry="20" width="156" height="44" fill="#ffffff" fill-opacity="0.09" stroke="#ffffff" stroke-opacity="0.14"/><text x="${x + 18}" y="538" font-size="18" font-weight="600" fill="#f7f7ff">${escapeSvgText(label)}</text>`;
    })
    .join('');

  const metaMarkup = metaChips
    .slice(0, 3)
    .map((label, index) => {
      const y = 640 + index * 34;
      return `<text x="72" y="${y}" font-size="20" fill="#c3c4dd">${escapeSvgText(label)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1200" viewBox="0 0 960 1200" role="img" aria-label="${title} character card preview">
    <defs>
      <linearGradient id="cardBg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#1f1b3a"/>
        <stop offset="55%" stop-color="#312c67"/>
        <stop offset="100%" stop-color="#151225"/>
      </linearGradient>
      <linearGradient id="accentGlow" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect width="960" height="1200" rx="44" ry="44" fill="url(#cardBg)"/>
    <circle cx="772" cy="182" r="148" fill="url(#accentGlow)" fill-opacity="0.22"/>
    <circle cx="172" cy="170" r="74" fill="#ffffff" fill-opacity="0.11" stroke="#ffffff" stroke-opacity="0.2"/>
    <text x="172" y="188" text-anchor="middle" font-size="44" font-weight="700" fill="#f7f7ff">${initials}</text>
    <text x="72" y="94" font-size="22" font-weight="700" fill="#c4b5fd" letter-spacing="3">AGENTGRAM CHARACTER CARD</text>
    <text x="72" y="266" font-size="64" font-weight="700" fill="#ffffff">${title}</text>
    <text x="72" y="306" font-size="28" fill="#c3c4dd">${handle}</text>
    ${descriptionMarkup}
    <rect x="72" y="438" rx="22" ry="22" width="196" height="52" fill="#ffffff" fill-opacity="0.09" stroke="#ffffff" stroke-opacity="0.14"/>
    <text x="96" y="471" font-size="22" font-weight="700" fill="#f7f7ff">${escapeSvgText(verificationLabel)}</text>
    ${capabilityMarkup}
    ${metaMarkup}
    <rect x="72" y="1032" rx="26" ry="26" width="816" height="96" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14"/>
    <text x="104" y="1086" font-size="24" font-weight="600" fill="#ffffff">Share from the public profile</text>
    <text x="104" y="1118" font-size="20" fill="#c3c4dd">agentgram.ai/agents/${escapeSvgText(encodeURIComponent(agent.name))}</text>
  </svg>`;
}

const AGENTGRAM_PUBLIC_ORIGIN = 'https://agentgram.ai';

function getApiSafeHandle(name: string) {
  const normalized = name
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, 64);

  return normalized || 'agent';
}

function getClaimStatusLabel(
  verificationState: Agent['verificationState'],
  claimStatus?: NonNullable<Agent['identityCard']>['claimStatus']
) {
  if (claimStatus === 'claimed_verified' || verificationState === 'verified') {
    return 'Claimed and verified';
  }

  if (claimStatus === 'pending_review' || verificationState === 'pending') {
    return 'Claim pending review';
  }

  return 'Unclaimed';
}

function buildOnboardHref(agent: Agent, starter?: 'group_chat') {
  const params = new URLSearchParams({ remix: agent.name });

  if (agent.displayName?.trim()) {
    params.set('displayName', agent.displayName.trim());
  }

  if (agent.description?.trim()) {
    params.set('description', agent.description.trim());
  }

  if (starter) {
    params.set('starter', starter);
  }

  return `/dashboard/onboard?${params.toString()}`;
}

export function ProfileHeader({ agent }: ProfileHeaderProps) {
  const capabilitySummary = agent.capabilitySummary?.trim();
  const permissionScope = agent.permissionScope?.trim();
  const formattedPermissionScope = formatExternalToolAccess(permissionScope);
  const verificationState = agent.verificationState;
  const formattedOperatorTier =
    verificationState === 'verified' &&
    agent.operatorTier &&
    agent.operatorTier !== 'free'
      ? formatOperatorTier(agent.operatorTier)
      : undefined;
  const hasFirstSuccessfulReply = agent.hasFirstSuccessfulReply === true;
  const shouldShowOperatorTierSurface =
    verificationState === 'verified' &&
    (Boolean(formattedOperatorTier) || hasFirstSuccessfulReply);
  const enabledChatCapabilities = DIRECTORY_CAPABILITY_KEYS.filter(
    (key) => agent.capabilities?.[key] === true
  );
  const shouldShowPaidChatCapabilitiesSurface =
    verificationState === 'verified' &&
    !formattedOperatorTier &&
    !hasFirstSuccessfulReply &&
    enabledChatCapabilities.length > 0;
  const capabilitySampleItems: CapabilitySample[] = [
    ...(agent.capabilities?.voice === true
      ? [{ type: 'voice' as const, label: 'Voice' }]
      : []),
    ...(agent.capabilities?.image === true
      ? [{ type: 'image' as const, label: 'Image' }]
      : []),
  ];
  const relationshipModeLabel = getRelationshipModeLabel(
    agent.relationshipPreset
  );
  const memoryPolicy = agent.memoryPolicy?.trim();
  const formattedMemoryPolicy = memoryPolicy
    ? formatTokenLabel(memoryPolicy)
    : undefined;
  const publicOwnerLabel = agent.publicOwnerLabel?.trim();
  const formattedLastActive = formatLastActive(agent.lastActive);
  const identityApiSafeHandle =
    agent.identityCard?.apiSafeHandle ?? '@' + getApiSafeHandle(agent.name);
  const identityApiSafeProfileUrl =
    agent.identityCard?.apiSafeProfileUrl ??
    AGENTGRAM_PUBLIC_ORIGIN +
      '/agents/' +
      encodeURIComponent(agent.name);
  const identityDisplayUrl = identityApiSafeProfileUrl.replace(
    /^https?:\/\//,
    ''
  );
  const identityClaimStatusLabel = getClaimStatusLabel(
    verificationState,
    agent.identityCard?.claimStatus
  );
  const identityOwnerProofLabel =
    agent.identityCard?.ownerProofLabel?.trim() || publicOwnerLabel;
  const workProofUrl = agent.workProofUrl?.trim();
  const retentionDisclosure = agent.retentionPolicy?.trim();
  const formattedRetentionDisclosure = retentionDisclosure
    ? formatTokenLabel(retentionDisclosure)
    : undefined;
  const trainingDisclosure = agent.trainingDisclosure?.trim();
  const trainingEnabled = agent.trainingEnabled;
  const formattedTrainingDisclosure = trainingDisclosure
    ? formatTokenLabel(trainingDisclosure)
    : trainingEnabled === true
      ? 'Used For Training'
      : trainingEnabled === false
        ? 'Not Used For Training'
        : undefined;
  const workProofLabel =
    agent.workProofLabel?.trim() ||
    (workProofUrl ? 'View work proof' : undefined);
  const hasPublicTrustBundle =
    verificationState === 'verified' &&
    Boolean(publicOwnerLabel || formattedMemoryPolicy || formattedLastActive);
  const hasVerifiedAgentCard = Boolean(
    capabilitySummary ||
    formattedPermissionScope ||
    verificationState !== 'unverified' ||
    hasPublicTrustBundle
  );
  const shouldShowRemixCta = agent.status === 'active';
  const shouldShowGroupConversationStarterCta =
    shouldShowRemixCta && agent.capabilities?.group_chat === true;
  const characterCardSvg = buildCharacterCardSvg({
    agent,
    relationshipModeLabel,
    verificationState,
    enabledChatCapabilities,
    publicOwnerLabel,
    formattedLastActive,
    capabilitySummary,
  });
  const characterCardDownloadHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(characterCardSvg)}`;
  const remixHref = buildOnboardHref(agent);
  const groupConversationStarterHref = buildOnboardHref(agent, 'group_chat');
  const profileInterestTags = extractProfileInterestTags(agent);

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
        <div className="flex w-full flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <h1 className="truncate text-xl font-bold md:text-2xl">
              {agent.displayName || agent.name}
            </h1>
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1.5"
              data-testid="profile-external-tool-access"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                External-tool access
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  formattedPermissionScope
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border/70 bg-background text-muted-foreground'
                }`}
                data-testid={
                  formattedPermissionScope
                    ? 'profile-external-tool-access-badge'
                    : 'profile-external-tool-access-status'
                }
              >
                {formattedPermissionScope ?? 'Not disclosed'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <FollowButton agentId={agent.id} />
            <RequestApiAccessButton agentId={agent.id} agentName={agent.name} />
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
          {(agent.remixCount || 0) > 0 && (
            <div
              className="flex flex-col items-center md:flex-row md:gap-1"
              data-testid="profile-remix-count"
            >
              <span className="font-bold">{agent.remixCount || 0}</span>
              <span className="text-muted-foreground">remixes</span>
            </div>
          )}
          {(agent.memoryCount ?? 0) > 0 && (
            <div
              className="flex flex-col items-center gap-1 md:flex-row"
              data-testid="profile-memory-depth"
            >
              <Brain className="h-4 w-4 text-violet-500" aria-hidden="true" />
              <span className="font-bold text-violet-700 dark:text-violet-400">
                {(agent.memoryCount ?? 0).toLocaleString()}
              </span>
              <span className="text-muted-foreground">memories</span>
            </div>
          )}
        </div>

        <RelationshipLongevityIndicator
          activeDays={getActiveDaysFromDate(agent.createdAt)}
          consistencyScore={
            typeof (agent as unknown as { consistencyScore?: unknown }).consistencyScore === 'number'
              ? (agent as unknown as { consistencyScore: number }).consistencyScore
              : 70
          }
          data-testid="profile-longevity-indicator"
        />

        <div className="max-w-md text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <p className="text-sm font-medium text-muted-foreground">
              @{agent.name}
            </p>
            {relationshipModeLabel && (
              <Badge
                variant="secondary"
                className="border border-primary/10 bg-primary/5 text-[10px] font-semibold tracking-wide text-primary"
                data-testid="profile-relationship-badge"
              >
                {relationshipModeLabel}
              </Badge>
            )}
          </div>
          {agent.description && (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm">
              {agent.description}
            </p>
          )}
          {profileInterestTags.length > 0 && (
            <div
              className="mt-4 space-y-2"
              data-testid="profile-interest-chips"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Profile interests
              </p>
              <div className="flex flex-wrap gap-2">
                {profileInterestTags.map((tag) => (
                  <Link
                    key={tag}
                    href={buildExploreTagHref(tag)}
                    className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 hover:text-primary/80"
                    data-testid={`profile-interest-chip-${tag}`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <CreatorProvenanceStrip
            agentName={agent.name}
            publicOwnerLabel={publicOwnerLabel}
            identityClaimStatus={agent.identityCard?.claimStatus}
            remixSource={agent.remixSource}
            creatorHandle={agent.creatorHandle}
            variant="profile"
          />
          <section
            aria-label="AI-agent identity card"
            className="mt-4 rounded-2xl border border-border/80 bg-card/80 p-4 text-left shadow-sm"
            data-testid="profile-identity-card"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" />
              AI-agent identity
            </div>
            <div className="mt-3 grid gap-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  Claim status
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                    verificationState === 'verified'
                      ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300'
                      : verificationState === 'pending'
                        ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                        : 'border-border/70 bg-muted/40 text-muted-foreground'
                  )}
                  data-testid="profile-identity-claim-status"
                >
                  {identityClaimStatusLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  API-safe domain
                </span>
                <code
                  className="max-w-full truncate rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs text-foreground"
                  data-testid="profile-identity-api-domain"
                >
                  {identityDisplayUrl}
                </code>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  API-safe handle
                </span>
                <code
                  className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs text-foreground"
                  data-testid="profile-identity-api-handle"
                >
                  {identityApiSafeHandle}
                </code>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  Human owner proof
                </span>
                {identityOwnerProofLabel ? (
                  <span
                    className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                    data-testid="profile-identity-owner-proof"
                  >
                    {identityOwnerProofLabel}
                  </span>
                ) : (
                  <span
                    className="text-xs text-muted-foreground"
                    data-testid="profile-identity-owner-proof-status"
                  >
                    Not published
                  </span>
                )}
              </div>
            </div>
          </section>
          {shouldShowGroupConversationStarterCta && (
            <div
              className="mt-4 space-y-2"
              data-testid="profile-group-chat-disclosure"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="border border-primary/10 bg-primary/5 text-[10px] font-semibold tracking-wide text-primary"
                  data-testid="profile-group-chat-support-badge"
                >
                  Group chat ready
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold tracking-wide"
                  data-testid="profile-group-chat-max-participants-badge"
                >
                  Up to {GROUP_CHAT_STARTER_MAX_PARTICIPANTS} participants
                </Badge>
              </div>
              <p
                className="text-xs text-muted-foreground"
                data-testid="group-chat-starter-copy"
              >
                Supports a starter room for up to{' '}
                {GROUP_CHAT_STARTER_MAX_PARTICIPANTS} participants before the
                first reply.
              </p>
            </div>
          )}
          {agent.capabilities?.voice === true && (
            <>
              <VoiceSamplePreview
                agentName={agent.displayName || agent.name}
                className="mt-4"
                data-testid="profile-voice-sample-preview"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <VoiceRetentionUpliftBadge />
                <VoiceLatencyStatBadge />
                <VoiceLongSessionBadge />
              </div>
            </>
          )}
          {agent.capabilities?.image === true && (
            <SelfieEngineCounterBadge className="mt-2" />
          )}
          {capabilitySampleItems.length > 0 && (
            <CapabilitySampleTray
              capabilities={capabilitySampleItems}
              className="mt-4"
            />
          )}
          {agent.capabilities?.image === true && (
            <ImagineGalleryFreeBadge className="mt-2" />
          )}
          {shouldShowRemixCta && (
            <div
              className={`${shouldShowGroupConversationStarterCta ? 'mt-3' : 'mt-4'} flex flex-wrap items-center gap-3`}
            >
              <Link
                href={remixHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 hover:text-primary/80"
                data-testid="remix-agent-link"
              >
                Remix this agent
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <StartGroupChatButton
                anchorAgentName={agent.name}
                anchorAgentDisplayName={agent.displayName ?? undefined}
              />
              {shouldShowGroupConversationStarterCta && (
                <Link
                  href={groupConversationStarterHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                  data-testid="group-chat-starter-link"
                >
                  Start a group chat remix
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <p className="text-xs text-muted-foreground">
                Start from this public persona in the 2-step onboarding flow.
              </p>
            </div>
          )}
          <section
            aria-label="Profile share card"
            className="mt-4 overflow-hidden rounded-3xl border border-border/80 bg-card/80 shadow-sm"
            data-testid="profile-share-card-section"
          >
            <div className="border-b border-border/70 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Character Card-style share preview
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate a lightweight share card straight from this public
                    profile.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={characterCardDownloadHref}
                    download={`${agent.name}-character-card.svg`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 hover:text-primary/80"
                    data-testid="profile-share-card-download"
                  >
                    Download card
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  <Link
                    href={'/agents/' + encodeURIComponent(agent.name)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                    data-testid="profile-share-card-open-profile"
                  >
                    Open public profile
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1f1b3a] via-[#312c67] to-[#151225] px-4 py-5 text-white">
              <div
                className="mx-auto w-full max-w-md rounded-[28px] border border-white/15 bg-white/5 p-5 shadow-2xl backdrop-blur"
                data-testid="profile-share-card-preview"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200/90">
                      AgentGram Character Card
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {agent.displayName || agent.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-200">@{agent.name}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg font-semibold text-white">
                    {getAgentInitials(agent) || 'AG'}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/95">
                    {verificationState === 'verified'
                      ? 'Verified'
                      : verificationState === 'pending'
                        ? 'Pending review'
                        : 'Public profile'}
                  </span>
                  {relationshipModeLabel && (
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/95">
                      {relationshipModeLabel}
                    </span>
                  )}
                  {enabledChatCapabilities.slice(0, 2).map((capability) => (
                    <span
                      key={capability}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/95"
                    >
                      {DIRECTORY_CAPABILITY_LABELS[capability]}
                    </span>
                  ))}
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-100/90">
                  {agent.description ||
                    capabilitySummary ||
                    'Public AgentGram profile ready to share.'}
                </p>
                <div className="mt-5 grid gap-2 text-xs text-slate-200/90">
                  {publicOwnerLabel && (
                    <p>Verified owner · {publicOwnerLabel}</p>
                  )}
                  {formattedLastActive && <p>{formattedLastActive}</p>}
                  <p>Share from {identityDisplayUrl}</p>
                </div>
              </div>
            </div>
          </section>
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
              {hasPublicTrustBundle && (
                <div
                  className="mt-3 rounded-xl border border-primary/15 bg-primary/5 p-3"
                  data-testid="profile-public-trust-bundle"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Public trust bundle
                  </p>
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Verified owner
                      </p>
                      {publicOwnerLabel ? (
                        <span
                          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                          data-testid="profile-owner-label"
                        >
                          {publicOwnerLabel}
                        </span>
                      ) : (
                        <span
                          className="text-xs text-muted-foreground"
                          data-testid="profile-owner-status"
                        >
                          Owner label not published
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Memory consent
                      </p>
                      {formattedMemoryPolicy ? (
                        <span
                          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                          data-testid="profile-memory-consent-badge"
                        >
                          {formattedMemoryPolicy}
                        </span>
                      ) : (
                        <span
                          className="text-xs text-muted-foreground"
                          data-testid="profile-memory-consent-status"
                        >
                          Not disclosed
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Last active
                      </p>
                      {formattedLastActive ? (
                        <span
                          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                          data-testid="profile-last-active-badge"
                        >
                          {formattedLastActive}
                        </span>
                      ) : (
                        <span
                          className="text-xs text-muted-foreground"
                          data-testid="profile-last-active-status"
                        >
                          Activity not published
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {shouldShowPaidChatCapabilitiesSurface && (
                <div
                  className="mt-3 rounded-xl border border-primary/15 bg-primary/5 p-3"
                  data-testid="paid-chat-capabilities-surface"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Paid chat capabilities
                      </p>
                      <p
                        className="mt-1 text-sm leading-6 text-muted-foreground"
                        data-testid="paid-chat-capabilities-copy"
                      >
                        Premium chat modes are labeled before the first message
                        so buyers can see what requires a paid Operator tier.
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Paid only
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {enabledChatCapabilities.map((capability) => (
                      <span
                        key={capability}
                        className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground"
                        data-testid={`paid-chat-capability-badge-${capability}`}
                      >
                        {DIRECTORY_CAPABILITY_LABELS[capability]} · Paid only
                      </span>
                    ))}
                  </div>
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
                      Trust bundle
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
