import {
  AGENT_CAPABILITY_KEYS,
  type Agent,
  type AgentCapabilities,
} from '../types';
import type { PersonaResponse } from './persona';
import { transformPersona } from './persona';

function metadataValue(meta: Record<string, unknown>, path: string[]): unknown {
  let cur: unknown = meta;
  for (const seg of path) {
    if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

function metadataString(
  meta: Record<string, unknown>,
  paths: string[][]
): string | undefined {
  for (const path of paths) {
    const v = metadataValue(meta, path);
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function metadataBoolean(
  meta: Record<string, unknown>,
  paths: string[][]
): boolean | undefined {
  for (const path of paths) {
    const v = metadataValue(meta, path);
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      const n = v.trim().toLowerCase();
      if (['true', 'yes', 'on', 'enabled', 'allow', 'allowed'].includes(n))
        return true;
      if (
        [
          'false',
          'no',
          'off',
          'disabled',
          'deny',
          'denied',
          'not_allowed',
        ].includes(n)
      )
        return false;
    }
  }
  return undefined;
}

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
  if (!capabilities || typeof capabilities !== 'object' || Array.isArray(capabilities)) {
    return emptyCapabilities;
  }

  const capabilityRecord = capabilities as Record<string, unknown>;

  return AGENT_CAPABILITY_KEYS.reduce((acc, key) => {
    acc[key] = readCapabilityEnabled(capabilityRecord[key]);
    return acc;
  }, { ...emptyCapabilities });
}

/** Derive explicit public capability/trust fields from raw metadata. */
export function derivePublicFields(
  meta: Record<string, unknown>
): Pick<
  Agent,
  | 'capabilities'
  | 'memoryPolicy'
  | 'workProofUrl'
  | 'workProofLabel'
  | 'retentionPolicy'
  | 'trainingDisclosure'
  | 'trainingEnabled'
  | 'hasFirstSuccessfulReply'
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
    memoryPolicy: metadataString(meta, [
      ['memoryPolicy'],
      ['memory_policy'],
      ['memory', 'policy'],
      ['memoryVisibility'],
      ['memory', 'visibility'],
    ]),
    workProofUrl,
    workProofLabel:
      metadataString(meta, [
        ['workProofLabel'],
        ['work_proof_label'],
        ['proofLabel'],
        ['proof_label'],
        ['workProof', 'label'],
      ]) ?? (workProofUrl ? 'View work proof' : undefined),
    retentionPolicy: metadataString(meta, [
      ['retentionPolicy'],
      ['retention_policy'],
      ['dataRetention'],
      ['data_retention'],
      ['privacy', 'retention'],
    ]),
    trainingDisclosure: metadataString(meta, [
      ['trainingDisclosure'],
      ['training_disclosure'],
      ['trainingPolicy'],
      ['training_policy'],
      ['privacy', 'training'],
    ]),
    trainingEnabled: metadataBoolean(meta, [
      ['trainingEnabled'],
      ['training_enabled'],
      ['usesDataForTraining'],
      ['uses_data_for_training'],
      ['privacy', 'trainingEnabled'],
    ]),
    hasFirstSuccessfulReply:
      metadataBoolean(meta, [
        ['firstSuccessfulReply'],
        ['first_successful_reply'],
        ['milestones', 'firstSuccessfulReply'],
        ['milestones', 'first_successful_reply'],
        ['replyMilestones', 'firstSuccessfulReply'],
        ['reply_milestones', 'first_successful_reply'],
      ]) === true,
  };
}

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
    publicKey: agent.public_key || undefined,
    email: agent.email || undefined,
    emailVerified: agent.email_verified ?? false,
    axp: agent.axp ?? 0,
    verificationState:
      (agent.verification_state as Agent['verificationState']) ?? 'unverified',
    status: (agent.status as Agent['status']) ?? 'active',
    trustScore: agent.trust_score ?? 0,
    ...derivePublicFields(metadata),
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
    avatarUrl: author.avatar_url || undefined,
    createdAt: '',
    updatedAt: '',
    lastActive: '',
  };
}
