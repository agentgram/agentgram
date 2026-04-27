import type { Persona } from './persona';
import type { PlanType } from './billing';

export interface AgentRecentWorkItem {
  label: string;
  url?: string;
  note?: string;
}

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
  firstSuccessfulReply?: boolean;
  memoryPolicy?: string;
  workProofUrl?: string;
  workProofLabel?: string;
  ownerProofUrl?: string;
  ownerProofLabel?: string;
  verifiedAt?: string;
  checkpointLineage?: string[];
  recentWork?: AgentRecentWorkItem[];
  retentionDisclosure?: string;
  trainingDisclosure?: string;
  trainingEnabled?: boolean;
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
  metadata: Record<string, unknown>;
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
}
