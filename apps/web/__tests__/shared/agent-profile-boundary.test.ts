import { describe, expect, it } from 'vitest';
import {
  deriveAgentMemoryProfile,
  transformAgent,
  withActivePersona,
} from '@agentgram/shared';
import type { AgentResponse, PersonaResponse } from '@agentgram/shared';

const baseAgentResponse: AgentResponse = {
  id: 'agent-1',
  name: 'boundary-bot',
  display_name: 'Boundary Bot',
  description: 'Keeps profile layers tidy.',
  capability_summary: 'Ships patches with receipts.',
  permission_scope: 'repo_write',
  public_key: null,
  email: null,
  email_verified: true,
  axp: 42,
  status: 'active',
  trust_score: 0.88,
  metadata: {},
  avatar_url: null,
  created_at: '2026-04-28T00:00:00.000Z',
  updated_at: '2026-04-28T00:00:00.000Z',
  last_active: '2026-04-28T00:00:00.000Z',
  verification_state: 'verified',
};

const activePersona: PersonaResponse = {
  id: 'persona-1',
  agent_id: 'agent-1',
  name: 'Night Shift',
  role: 'Operator',
  personality: 'Calm and exact',
  backstory: null,
  communication_style: null,
  catchphrase: null,
  soul_url: null,
  is_active: true,
  created_at: '2026-04-28T00:00:00.000Z',
  updated_at: '2026-04-28T00:00:00.000Z',
};

describe('agent profile boundary helpers', () => {
  it('keeps memory disclosures independent from persona hydration', () => {
    const agent = transformAgent({
      ...baseAgentResponse,
      metadata: {
        memoryPolicy: 'ephemeral_only',
        retentionPolicy: '30_days',
        trainingEnabled: 'false',
      },
    });

    expect(agent.activePersona).toBeUndefined();
    expect(agent.memoryPolicy).toBe('ephemeral_only');
    expect(agent.retentionPolicy).toBe('30_days');
    expect(agent.trainingEnabled).toBe(false);

    const hydrated = withActivePersona(agent, activePersona);

    expect(hydrated.activePersona).toMatchObject({
      id: 'persona-1',
      name: 'Night Shift',
      personality: 'Calm and exact',
      isActive: true,
    });
    expect(hydrated.memoryPolicy).toBe('ephemeral_only');
    expect(hydrated.retentionPolicy).toBe('30_days');
    expect(hydrated.trainingEnabled).toBe(false);
  });

  it('derives only memory-layer disclosures from metadata aliases', () => {
    expect(
      deriveAgentMemoryProfile({
        persona: {
          memoryPolicy: 'should-not-be-read',
        },
        memory: {
          policy: 'session_only',
        },
        privacy: {
          retention: '7_days',
          trainingEnabled: 'true',
        },
      })
    ).toEqual({
      memoryPolicy: 'session_only',
      retentionPolicy: '7_days',
      trainingDisclosure: undefined,
      trainingEnabled: true,
    });
  });
});
