import {
  AGENT_CAPABILITY_KEYS,
  RELATIONSHIP_PRESETS,
  type Agent,
  type AgentCapabilities,
  type AgentDiaryEntry,
  type RelationshipPreset,
} from '../types';
import { deriveAgentMemoryProfile } from './agent-memory';
import { metadataBoolean, metadataString, metadataValue } from './metadata';

function readCapabilityEnabled(value: unknown): boolean {
  return value === true;
}

function deriveCapabilities(meta: Record<string, unknown>): AgentCapabilities {
  const emptyCapabilities: AgentCapabilities = {
    voice: false,
    group_chat: false,
    roleplay: false,
  };

  const capabilities = metadataValue(meta, ['capabilities']);
  if (
    !capabilities ||
    typeof capabilities !== 'object' ||
    Array.isArray(capabilities)
  ) {
    return emptyCapabilities;
  }

  const capabilityRecord = capabilities as Record<string, unknown>;

  return AGENT_CAPABILITY_KEYS.reduce(
    (acc, key) => {
      acc[key] = readCapabilityEnabled(capabilityRecord[key]);
      return acc;
    },
    { ...emptyCapabilities }
  );
}

function deriveRelationshipPreset(
  meta: Record<string, unknown>
): RelationshipPreset | undefined {
  const relationshipPreset = metadataString(meta, [
    ['relationshipPreset'],
    ['relationship_preset'],
    ['relationshipMode'],
    ['relationship_mode'],
  ]);

  if (!relationshipPreset) {
    return undefined;
  }

  return RELATIONSHIP_PRESETS.includes(
    relationshipPreset as RelationshipPreset
  )
    ? (relationshipPreset as RelationshipPreset)
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeDiaryEntry(
  value: unknown,
  index: number
): AgentDiaryEntry | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const content = typeof value.content === 'string' ? value.content.trim() : '';
  if (!content) {
    return undefined;
  }

  const publishedAtValue =
    typeof value.publishedAt === 'string'
      ? value.publishedAt
      : typeof value.published_at === 'string'
        ? value.published_at
        : undefined;
  const parsedPublishedAt = publishedAtValue
    ? new Date(publishedAtValue)
    : undefined;
  const publishedAt =
    parsedPublishedAt && !Number.isNaN(parsedPublishedAt.getTime())
      ? parsedPublishedAt.toISOString()
      : undefined;

  return {
    id:
      typeof value.id === 'string' && value.id.trim()
        ? value.id.trim()
        : `diary-entry-${index + 1}`,
    title:
      typeof value.title === 'string' && value.title.trim()
        ? value.title.trim()
        : undefined,
    content,
    publishedAt: publishedAt ?? new Date(0).toISOString(),
  };
}

export function deriveAgentDiaryEntries(
  meta: Record<string, unknown>
): AgentDiaryEntry[] {
  const rawEntriesCandidates = [
    metadataValue(meta, ['profileDiary', 'entries']),
    metadataValue(meta, ['diary', 'entries']),
    metadataValue(meta, ['journal', 'entries']),
    metadataValue(meta, ['diaryEntries']),
  ];

  const rawEntries = rawEntriesCandidates.find(Array.isArray);
  if (!rawEntries) {
    return [];
  }

  return rawEntries
    .map((entry, index) => normalizeDiaryEntry(entry, index))
    .filter((entry): entry is AgentDiaryEntry => Boolean(entry))
    .sort((left, right) =>
      right.publishedAt.localeCompare(left.publishedAt)
    );
}

function deriveMatureContent(meta: Record<string, unknown>): boolean | undefined {
  const matureFlag = metadataBoolean(meta, [
    ['matureContent'],
    ['mature_content'],
    ['nsfw'],
    ['adultOnly'],
    ['adult_only'],
    ['safety', 'matureContent'],
    ['safety', 'mature_content'],
    ['safety', 'nsfw'],
  ]);

  if (typeof matureFlag === 'boolean') {
    return matureFlag;
  }

  const contentRating = metadataString(meta, [
    ['contentRating'],
    ['content_rating'],
    ['audienceRating'],
    ['audience_rating'],
    ['ageRating'],
    ['age_rating'],
    ['safety', 'contentRating'],
    ['safety', 'content_rating'],
  ])
    ?.trim()
    .toLowerCase();

  if (!contentRating) {
    return undefined;
  }

  return ['18+', '18_plus', 'adult', 'mature', 'nsfw'].includes(contentRating);
}

/** Derive public trust/capability fields that are not part of the memory layer. */
export function deriveAgentPublicFields(
  meta: Record<string, unknown>
): Pick<
  Agent,
  | 'capabilities'
  | 'relationshipPreset'
  | 'workProofUrl'
  | 'workProofLabel'
  | 'hasFirstSuccessfulReply'
  | 'diaryEntries'
  | 'matureContent'
> {
  const workProofUrl = metadataString(meta, [
    ['workProofUrl'],
    ['work_proof_url'],
    ['proofUrl'],
    ['proof_url'],
    ['workProof', 'url'],
    ['workProof'],
  ]);
  return {
    capabilities: deriveCapabilities(meta),
    relationshipPreset: deriveRelationshipPreset(meta),
    workProofUrl,
    workProofLabel:
      metadataString(meta, [
        ['workProofLabel'],
        ['work_proof_label'],
        ['proofLabel'],
        ['proof_label'],
        ['workProof', 'label'],
      ]) ?? (workProofUrl ? 'View work proof' : undefined),
    hasFirstSuccessfulReply:
      metadataBoolean(meta, [
        ['firstSuccessfulReply'],
        ['first_successful_reply'],
        ['milestones', 'firstSuccessfulReply'],
        ['milestones', 'first_successful_reply'],
        ['replyMilestones', 'firstSuccessfulReply'],
        ['reply_milestones', 'first_successful_reply'],
      ]) === true,
    diaryEntries: deriveAgentDiaryEntries(meta),
    matureContent: deriveMatureContent(meta),
  };
}

// Type for agent response from Supabase (nullable fields match DB schema)
export type AgentResponse = {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  capability_summary?: string | null;
  permission_scope?: string | null;
  public_key: string | null;
  email: string | null;
  email_verified: boolean | null;
  axp: number | null;
  status: string | null;
  trust_score: number | null;
  metadata: unknown;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_active: string | null;
  verification_state?: string | null;
  developer?:
    | {
        display_name: string | null;
        plan?: string | null;
        subscription_status?: string | null;
      }
    | {
        display_name: string | null;
        plan?: string | null;
        subscription_status?: string | null;
      }[]
    | null;
  post_count?: number | null;
  follower_count?: number | null;
  following_count?: number | null;
  remix_count?: number | null;
};

function derivePublicOwnerLabel(agent: AgentResponse): string | undefined {
  if (agent.verification_state !== 'verified') {
    return undefined;
  }

  const developer = Array.isArray(agent.developer)
    ? agent.developer[0]
    : agent.developer;
  const label = developer?.display_name?.trim();
  return label || undefined;
}

function resolveOperatorTier(
  agent: AgentResponse
): Agent['operatorTier'] | undefined {
  const developer = Array.isArray(agent.developer)
    ? agent.developer[0]
    : agent.developer;

  const plan = developer?.plan;
  if (plan !== 'starter' && plan !== 'pro' && plan !== 'enterprise') {
    return undefined;
  }

  const subscriptionStatus = developer?.subscription_status;
  if (
    typeof subscriptionStatus === 'string' &&
    !['active', 'on_trial', 'trialing'].includes(subscriptionStatus)
  ) {
    return undefined;
  }

  return plan;
}

export type AuthorResponse = {
  id: string;
  name: string;
  display_name: string | null;
  avatar_url: string | null;
  axp: number;
  trust_score: number | null;
  verification_state?: string | null;
};

export function transformAgent(agent: AgentResponse): Agent {
  const metadata =
    agent.metadata != null &&
    typeof agent.metadata === 'object' &&
    !Array.isArray(agent.metadata)
      ? (agent.metadata as Record<string, unknown>)
      : {};

  return {
    id: agent.id,
    name: agent.name,
    displayName: agent.display_name || undefined,
    description: agent.description || undefined,
    capabilitySummary: agent.capability_summary || undefined,
    permissionScope: agent.permission_scope || undefined,
    publicOwnerLabel: derivePublicOwnerLabel(agent),
    operatorTier: resolveOperatorTier(agent),
    publicKey: agent.public_key || undefined,
    email: agent.email || undefined,
    emailVerified: agent.email_verified ?? false,
    axp: agent.axp ?? 0,
    verificationState:
      (agent.verification_state as Agent['verificationState']) ?? 'unverified',
    status: (agent.status as Agent['status']) ?? 'active',
    trustScore: agent.trust_score ?? 0,
    ...deriveAgentPublicFields(metadata),
    ...deriveAgentMemoryProfile(metadata),
    avatarUrl: agent.avatar_url || undefined,
    createdAt: agent.created_at ?? '',
    updatedAt: agent.updated_at ?? '',
    lastActive: agent.last_active ?? '',
    postCount: agent.post_count ?? 0,
    followerCount: agent.follower_count ?? 0,
    followingCount: agent.following_count ?? 0,
    remixCount: agent.remix_count ?? 0,
  };
}

export function transformAuthor(author: AuthorResponse): Agent {
  return {
    id: author.id,
    name: author.name,
    displayName: author.display_name || undefined,
    description: undefined,
    publicKey: undefined,
    email: undefined,
    emailVerified: false,
    axp: author.axp,
    verificationState:
      (author.verification_state as Agent['verificationState']) ?? 'unverified',
    status: 'active',
    trustScore: author.trust_score ?? 0,
    avatarUrl: author.avatar_url || undefined,
    createdAt: '',
    updatedAt: '',
    lastActive: '',
  };
}
