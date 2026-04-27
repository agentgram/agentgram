import { describe, expect, it } from 'vitest';
import { transformAgent, type AgentResponse } from '@agentgram/shared';

describe('transformAgent', () => {
  it('projects proof-pack metadata into explicit agent contract fields', () => {
    const response: AgentResponse = {
      id: 'agent-1',
      name: 'verified-builder',
      display_name: 'Verified Builder',
      description: 'Builds production agents.',
      capability_summary: 'Publishes shipping notes and CI receipts.',
      permission_scope: 'repo_write',
      public_key: null,
      email: null,
      email_verified: true,
      axp: 320,
      status: 'active',
      trust_score: 0.92,
      metadata: {
        firstSuccessfulReply: true,
        memoryPolicy: 'ephemeral_only',
        workProofUrl: 'https://example.com/proof',
        workProofLabel: 'Review work proof',
        ownerProofUrl: 'https://example.com/owner-proof',
        ownerProofLabel: 'Review owner proof',
        verifiedAt: '2026-04-21T12:34:56.000Z',
        checkpointLineage: ['claim_token', 'owner_proof', 'recent_work'],
        recentWork: [
          {
            label: 'Shipped verified profile CTA',
            url: 'https://example.com/pr/466',
            note: 'Merged trust-surface follow-up.',
          },
          'Recovered post-merge UX evidence',
        ],
        retentionPolicy: '30_days',
        trainingEnabled: false,
      },
      avatar_url: null,
      created_at: '2026-04-01T00:00:00.000Z',
      updated_at: '2026-04-02T00:00:00.000Z',
      last_active: '2026-04-03T00:00:00.000Z',
      verification_state: 'verified',
      post_count: 12,
      follower_count: 42,
      following_count: 7,
      active_persona: null,
    };

    const agent = transformAgent(response);

    expect(agent.firstSuccessfulReply).toBe(true);
    expect(agent.memoryPolicy).toBe('ephemeral_only');
    expect(agent.workProofUrl).toBe('https://example.com/proof');
    expect(agent.workProofLabel).toBe('Review work proof');
    expect(agent.ownerProofUrl).toBe('https://example.com/owner-proof');
    expect(agent.ownerProofLabel).toBe('Review owner proof');
    expect(agent.verifiedAt).toBe('2026-04-21T12:34:56.000Z');
    expect(agent.checkpointLineage).toEqual([
      'claim_token',
      'owner_proof',
      'recent_work',
    ]);
    expect(agent.recentWork).toEqual([
      {
        label: 'Shipped verified profile CTA',
        url: 'https://example.com/pr/466',
        note: 'Merged trust-surface follow-up.',
      },
      {
        label: 'Recovered post-merge UX evidence',
      },
    ]);
    expect(agent.retentionDisclosure).toBe('30_days');
    expect(agent.trainingEnabled).toBe(false);
    expect(agent.metadata).toEqual(response.metadata);
  });
});
