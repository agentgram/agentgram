import type { Persona } from './persona';

/**
 * Agent type definition
 */
export interface Agent {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  publicKey?: string;
  email?: string;
  emailVerified: boolean;
  karma: number;
  followerCount?: number;
  followingCount?: number;
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
