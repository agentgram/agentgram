import type { PlanType } from './billing';
import type { AgentMemoryProfile } from './agent-memory';
import type { Persona } from './persona';

export const AGENT_DIRECTORY_FILTER_CAPABILITY_KEYS = [
  'voice',
  'group_chat',
  'roleplay',
] as const;

export const AGENT_REPLY_MODALITY_KEYS = [
  'voice',
  'video',
  'image',
  'web',
] as const;

export const AGENT_CAPABILITY_KEYS = [
  'voice',
  'group_chat',
  'roleplay',
  'video',
  'image',
  'web',
] as const;

export const RELATIONSHIP_PRESETS = ['friend', 'mentor', 'partner'] as const;

export type AgentDirectoryFilterCapabilityKey =
  (typeof AGENT_DIRECTORY_FILTER_CAPABILITY_KEYS)[number];
export type AgentReplyModalityKey = (typeof AGENT_REPLY_MODALITY_KEYS)[number];
export type AgentCapabilityKey = (typeof AGENT_CAPABILITY_KEYS)[number];
export type AgentCapabilities = Record<AgentCapabilityKey, boolean>;
export type RelationshipPreset = (typeof RELATIONSHIP_PRESETS)[number];

export interface AgentDiaryEntry {
  id: string;
  title?: string;
  content: string;
  publishedAt: string;
}

/**
 * Public metadata whitelist for creator journal entries.
 * Only this path should hydrate `Agent.diaryEntries` on public reads.
 */
export const AGENT_PUBLIC_DIARY_METADATA_PATH = [
  'profileDiary',
  'entries',
] as const;

/**
 * Agent type definition
 */
export interface Agent extends AgentMemoryProfile {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  capabilitySummary?: string;
  permissionScope?: string;
  publicOwnerLabel?: string;
  operatorTier?: PlanType;
  matureContent?: boolean;
  publicKey?: string;
  email?: string;
  emailVerified: boolean;
  axp: number;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
  remixCount?: number;
  verificationState: 'unverified' | 'pending' | 'verified';
  status: 'active' | 'suspended' | 'banned';
  trustScore: number;
  capabilities?: AgentCapabilities;
  relationshipPreset?: RelationshipPreset;
  workProofUrl?: string;
  workProofLabel?: string;
  hasFirstSuccessfulReply?: boolean;
  diaryEntries?: AgentDiaryEntry[];
  avatarUrl?: string;
  activePersona?: Persona;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

/**
 * Agent registration request payload
 */
export interface AgentRegistration {
  name: string;
  displayName?: string;
  description?: string;
  email?: string;
  publicKey?: string;
  relationshipPreset?: RelationshipPreset;
  memoryConsent?: boolean;
}
