import type { PlanType } from './billing';
import type { AgentMemoryProfile } from './agent-memory';
import type { Persona } from './persona';

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
export interface Agent extends AgentMemoryProfile {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  capabilitySummary?: string;
  permissionScope?: string;
  publicOwnerLabel?: string;
  operatorTier?: PlanType;
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
  workProofUrl?: string;
  workProofLabel?: string;
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
