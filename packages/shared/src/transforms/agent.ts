import type { Agent, AgentRecentWorkItem } from '../types';
import type { PersonaResponse } from './persona';
import { transformPersona } from './persona';

// Type for agent response from Supabase (nullable fields match DB schema)
export type AgentResponse = {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  capability_summary: string | null;
  permission_scope: string | null;
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
  verification_state: string | null;
  post_count?: number | null;
  follower_count?: number | null;
  following_count?: number | null;
  active_persona?: PersonaResponse | null;
};

export type AuthorResponse = {
  id: string;
  name: string;
  display_name: string | null;
  avatar_url: string | null;
  axp: number;
  trust_score: number | null;
  verification_state?: string | null;
};

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
  metadata: Record<string, unknown>,
  paths: string[][]
): string | undefined {
  for (const path of paths) {
    const value = readMetadataValue(metadata, path);
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function readMetadataBoolean(
  metadata: Record<string, unknown>,
  paths: string[][]
): boolean | undefined {
  for (const path of paths) {
    const value = readMetadataValue(metadata, path);
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
  metadata: Record<string, unknown>,
  paths: string[][]
): unknown {
  for (const path of paths) {
    const value = readMetadataValue(metadata, path);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function readMetadataStringList(
  metadata: Record<string, unknown>,
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

function readMetadataRecentWork(
  metadata: Record<string, unknown>,
  paths: string[][]
): AgentRecentWorkItem[] {
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
    .filter((item): item is AgentRecentWorkItem => Boolean(item));
}

export function transformAgent(agent: AgentResponse): Agent {
  const metadata =
    agent.metadata != null &&
    typeof agent.metadata === 'object' &&
    !Array.isArray(agent.metadata)
      ? (agent.metadata as Record<string, unknown>)
      : {};

  const firstSuccessfulReply =
    readMetadataBoolean(metadata, [
      ['firstSuccessfulReply'],
      ['first_successful_reply'],
      ['milestones', 'firstSuccessfulReply'],
      ['milestones', 'first_successful_reply'],
      ['replyMilestones', 'firstSuccessfulReply'],
      ['reply_milestones', 'first_successful_reply'],
    ]) ?? undefined;
  const memoryPolicy = readMetadataString(metadata, [
    ['memoryPolicy'],
    ['memory_policy'],
    ['memory', 'policy'],
    ['memoryVisibility'],
    ['memory', 'visibility'],
  ]);
  const workProofUrl = readMetadataString(metadata, [
    ['workProofUrl'],
    ['work_proof_url'],
    ['proofUrl'],
    ['proof_url'],
    ['workProof', 'url'],
    ['workProof'],
  ]);
  const workProofLabel =
    readMetadataString(metadata, [
      ['workProofLabel'],
      ['work_proof_label'],
      ['proofLabel'],
      ['proof_label'],
      ['workProof', 'label'],
    ]) ?? (workProofUrl ? 'View work proof' : undefined);
  const ownerProofUrl = readMetadataString(metadata, [
    ['ownerProofUrl'],
    ['owner_proof_url'],
    ['ownerProof', 'url'],
    ['verification', 'ownerProofUrl'],
    ['verification', 'owner_proof_url'],
  ]);
  const ownerProofLabel =
    readMetadataString(metadata, [
      ['ownerProofLabel'],
      ['owner_proof_label'],
      ['ownerProof', 'label'],
      ['verification', 'ownerProofLabel'],
      ['verification', 'owner_proof_label'],
    ]) ?? (ownerProofUrl ? 'Review owner proof' : undefined);
  const verifiedAt = readMetadataString(metadata, [
    ['verifiedAt'],
    ['verified_at'],
    ['verification', 'verifiedAt'],
    ['verification', 'verified_at'],
  ]);
  const checkpointLineage = readMetadataStringList(metadata, [
    ['checkpointLineage'],
    ['checkpoint_lineage'],
    ['verification', 'checkpointLineage'],
    ['verification', 'checkpoint_lineage'],
    ['proofPack', 'checkpointLineage'],
    ['proof_pack', 'checkpoint_lineage'],
  ]);
  const recentWork = readMetadataRecentWork(metadata, [
    ['recentWork'],
    ['recent_work'],
    ['workLog', 'recent'],
    ['work_log', 'recent'],
    ['proofPack', 'recentWork'],
    ['proof_pack', 'recent_work'],
  ]);
  const retentionDisclosure = readMetadataString(metadata, [
    ['retentionPolicy'],
    ['retention_policy'],
    ['dataRetention'],
    ['data_retention'],
    ['privacy', 'retention'],
  ]);
  const trainingDisclosure = readMetadataString(metadata, [
    ['trainingDisclosure'],
    ['training_disclosure'],
    ['trainingPolicy'],
    ['training_policy'],
    ['privacy', 'training'],
  ]);
  const trainingEnabled =
    readMetadataBoolean(metadata, [
      ['trainingEnabled'],
      ['training_enabled'],
      ['usesDataForTraining'],
      ['uses_data_for_training'],
      ['privacy', 'trainingEnabled'],
    ]) ?? undefined;

  return {
    id: agent.id,
    name: agent.name,
    displayName: agent.display_name || undefined,
    description: agent.description || undefined,
    capabilitySummary: agent.capability_summary || undefined,
    permissionScope: agent.permission_scope || undefined,
    firstSuccessfulReply,
    memoryPolicy,
    workProofUrl,
    workProofLabel,
    ownerProofUrl,
    ownerProofLabel,
    verifiedAt,
    checkpointLineage,
    recentWork,
    retentionDisclosure,
    trainingDisclosure,
    trainingEnabled,
    publicKey: agent.public_key || undefined,
    email: agent.email || undefined,
    emailVerified: agent.email_verified ?? false,
    axp: agent.axp ?? 0,
    verificationState:
      (agent.verification_state as Agent['verificationState']) ?? 'unverified',
    status: (agent.status as Agent['status']) ?? 'active',
    trustScore: agent.trust_score ?? 0,
    metadata,
    avatarUrl: agent.avatar_url || undefined,
    activePersona: agent.active_persona
      ? transformPersona(agent.active_persona)
      : undefined,
    createdAt: agent.created_at ?? '',
    updatedAt: agent.updated_at ?? '',
    lastActive: agent.last_active ?? '',
    postCount: agent.post_count ?? 0,
    followerCount: agent.follower_count ?? 0,
    followingCount: agent.following_count ?? 0,
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
    metadata: {},
    avatarUrl: author.avatar_url || undefined,
    createdAt: '',
    updatedAt: '',
    lastActive: '',
  };
}
