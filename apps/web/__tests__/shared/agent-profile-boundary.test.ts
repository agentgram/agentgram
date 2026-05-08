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
        relationshipPreset: 'friend',
        memoryPolicy: 'ephemeral_only',
        retentionPolicy: '30_days',
        trainingEnabled: 'false',
      },
    });

    expect(agent.activePersona).toBeUndefined();
    expect(agent.relationshipPreset).toBe('friend');
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

  it('derives public diary entries only from profileDiary.entries and sorts newest first', () => {
    const agent = transformAgent({
      ...baseAgentResponse,
      metadata: {
        profileDiary: {
          entries: [
            {
              id: 'entry-1',
              title: 'Initial ship',
              content: 'Shipped the first profile intro.',
              publishedAt: '2026-04-27T10:00:00.000Z',
            },
            {
              id: 'entry-2',
              content: 'Added a public journal surface for creators.',
              publishedAt: '2026-04-29T08:30:00.000Z',
            },
            {
              id: 'entry-3',
              content: '   ',
              publishedAt: '2026-04-30T08:30:00.000Z',
            },
          ],
          privateDrafts: [
            {
              id: 'private-draft',
              content: 'This draft should never leak.',
              publishedAt: '2026-05-01T08:30:00.000Z',
            },
          ],
        },
        diary: {
          entries: [
            {
              id: 'alias-entry',
              content: 'Legacy alias should stay private.',
              publishedAt: '2026-05-02T08:30:00.000Z',
            },
          ],
        },
        journal: {
          entries: [
            {
              id: 'journal-entry',
              content: 'Journal alias should not hydrate public reads.',
              publishedAt: '2026-05-03T08:30:00.000Z',
            },
          ],
        },
        diaryEntries: [
          {
            id: 'flat-alias-entry',
            content: 'Flat alias should not leak either.',
            publishedAt: '2026-05-04T08:30:00.000Z',
          },
        ],
      },
    });

    expect(agent.diaryEntries).toEqual([
      {
        id: 'entry-2',
        title: undefined,
        content: 'Added a public journal surface for creators.',
        publishedAt: '2026-04-29T08:30:00.000Z',
      },
      {
        id: 'entry-1',
        title: 'Initial ship',
        content: 'Shipped the first profile intro.',
        publishedAt: '2026-04-27T10:00:00.000Z',
      },
    ]);
  });

  it('derives public starter prompts only from profileStarters.items', () => {
    const agent = transformAgent({
      ...baseAgentResponse,
      metadata: {
        profileStarters: {
          items: [
            {
              id: 'starter-1',
              title: 'Incident brief',
              description: 'Best for a fast handoff before you dig into the logs.',
              prompt:
                'Summarize the incident, the likely cause, and the safest next step.',
            },
            {
              name: 'Launch plan',
              message: 'Give me a public launch plan for this agent by end of day.',
            },
            {
              id: 'starter-3',
              prompt: '   ',
            },
          ],
          drafts: [
            {
              id: 'starter-draft',
              prompt: 'Private draft starter that should never be public.',
            },
          ],
        },
        starterPrompts: [
          {
            id: 'flat-alias',
            prompt: 'Flat alias should not hydrate public reads.',
          },
        ],
      },
    });

    expect(agent.starterPrompts).toEqual([
      {
        id: 'starter-1',
        title: 'Incident brief',
        description: 'Best for a fast handoff before you dig into the logs.',
        prompt:
          'Summarize the incident, the likely cause, and the safest next step.',
      },
      {
        id: 'starter-prompt-2',
        title: 'Launch plan',
        description: undefined,
        prompt: 'Give me a public launch plan for this agent by end of day.',
      },
    ]);
  });

  it('ignores unknown relationship metadata aliases', () => {
    const agent = transformAgent({
      ...baseAgentResponse,
      metadata: {
        relationshipMode: 'coach',
      },
    });

    expect(agent.relationshipPreset).toBeUndefined();
  });
});
