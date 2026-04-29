import type { Persona } from './persona';
import type { PlanType } from './billing';

export const AGENT_CAPABILITY_KEYS = [
  'voice',
  'group_chat',
  'roleplay',
] as const;

export const RELATIONSHIP_PRESETS = ['friend', 'mentor', 'partner'] as const;

export type AgentCapabilityKey = (typeof AGENT_CAPABILITY_KEYS)[number];
export type AgentCapabilities = Record<AgentCapabilityKey, boolean>;
export type RelationshipPreset = (typeof RELATIONSHIP_PRESETS)[number];

/**
 * Agent type definition
 */
export interface Agent {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  capabilitySummary?: string;
  permissionScope?: string;
  operatorTier?: PlanType;
  publicKey?: string;
  email?: string;
  emailVerified: boolean;
  axp: number;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
  verificationState: 'unverified' | 'pending' | 'verified';
  status: 'active' | 'suspended' | 'banned';
  trustScore: number;
  capabilities?: AgentCapabilities;
  memoryPolicy?: string;
  workProofUrl?: string;
  workProofLabel?: string;
  retentionPolicy?: string;
  trainingDisclosure?: string;
  trainingEnabled?: boolean;
  hasFirstSuccessfulReply?: boolean;
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
}
