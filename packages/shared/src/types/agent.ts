import type { PlanType } from './billing';
import type { AgentMemoryProfile } from './agent-memory';
import type { Persona } from './persona';
import type { StoryThread } from './story';

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

export const RELATIONSHIP_GOAL_FACETS = [
  'companionship',
  'guidance',
  'romance',
] as const;

export const WORLDBUILDING_FACETS = [
  'contemporary',
  'fantasy',
  'sci_fi',
] as const;

export type AgentDirectoryFilterCapabilityKey =
  (typeof AGENT_DIRECTORY_FILTER_CAPABILITY_KEYS)[number];
export type AgentReplyModalityKey = (typeof AGENT_REPLY_MODALITY_KEYS)[number];
export type AgentCapabilityKey = (typeof AGENT_CAPABILITY_KEYS)[number];
export type AgentCapabilities = Record<AgentCapabilityKey, boolean>;
export type RelationshipPreset = (typeof RELATIONSHIP_PRESETS)[number];
export type RelationshipGoalFacet = (typeof RELATIONSHIP_GOAL_FACETS)[number];
export type WorldbuildingFacet = (typeof WORLDBUILDING_FACETS)[number];

export interface AgentDiaryEntry {
  id: string;
  title?: string;
  content: string;
  publishedAt: string;
}

export interface AgentStarterPrompt {
  id: string;
  title?: string;
  description?: string;
  prompt: string;
}

export type AgentIdentityClaimStatus =
  | 'claimed_verified'
  | 'pending_review'
  | 'unclaimed';

export interface AgentIdentityCard {
  claimStatus: AgentIdentityClaimStatus;
  apiSafeHandle: string;
  apiSafeProfileUrl: string;
  ownerProofLabel?: string;
  ownerProofUrl?: string;
  ownerProofLinkLabel?: string;
}

/**
 * Public metadata whitelist for creator-written starter prompts.
 * Only this path should hydrate `Agent.starterPrompts` on public reads.
 */
export const AGENT_PUBLIC_STARTER_PROMPTS_METADATA_PATH = [
  'profileStarters',
  'items',
] as const;

/**
 * Public metadata whitelist for creator journal entries.
 * Only this path should hydrate `Agent.diaryEntries` on public reads.
 */
export const AGENT_PUBLIC_DIARY_METADATA_PATH = [
  'profileDiary',
  'entries',
] as const;

/**
 * Public metadata whitelist for creator-authored story threads.
 * Only this path should hydrate `Agent.storyThreads` on public reads.
 */
export const AGENT_PUBLIC_STORY_THREADS_METADATA_PATH = [
  'profileStories',
  'threads',
] as const;

export interface AgentRemixSource {
  id: string;
  name: string;
  displayName?: string;
}

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
  identityCard?: AgentIdentityCard;
  remixSource?: AgentRemixSource;
  creatorHandle?: string;
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
  relationshipGoal?: RelationshipGoalFacet;
  worldbuilding?: WorldbuildingFacet;
  interestTags?: string[];
  workProofUrl?: string;
  workProofLabel?: string;
  hasFirstSuccessfulReply?: boolean;
  starterPrompts?: AgentStarterPrompt[];
  diaryEntries?: AgentDiaryEntry[];
  storyThreads?: StoryThread[];
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
