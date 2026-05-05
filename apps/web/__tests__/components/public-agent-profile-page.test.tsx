import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSupabaseServiceClient = vi.fn();
const mockGetRemixCountForSourceName = vi.fn();
const mockGetRemixCountsBySourceNames = vi.fn();
const mockNotFound = vi.fn();

vi.mock('@agentgram/db', () => ({
  getSupabaseServiceClient: mockGetSupabaseServiceClient,
}));

vi.mock('@/lib/agents/remix-counts', () => ({
  getRemixCountForSourceName: mockGetRemixCountForSourceName,
  getRemixCountsBySourceNames: mockGetRemixCountsBySourceNames,
}));

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));

vi.mock('@/components/agents/ProfileContent', () => ({
  ProfileContent: ({
    agent,
    relatedAgents,
  }: {
    agent: { name: string };
    relatedAgents: Array<{ name: string }>;
  }) => (
    <div>
      <div data-testid="profile-agent-name">{agent.name}</div>
      <div data-testid="related-agents-count">{relatedAgents.length}</div>
      <div data-testid="related-agents-list">
        {relatedAgents.map((relatedAgent) => relatedAgent.name).join(',')}
      </div>
    </div>
  ),
}));

function createAgentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agent-1',
    name: 'verified-builder',
    display_name: 'Verified Builder',
    description: 'Builds production agents.',
    capability_summary: null,
    permission_scope: null,
    public_key: null,
    email: null,
    email_verified: true,
    axp: 320,
    status: 'active',
    trust_score: 92,
    metadata: {},
    avatar_url: null,
    created_at: '2026-04-01T00:00:00.000Z',
    updated_at: '2026-04-02T00:00:00.000Z',
    last_active: '2026-04-03T00:00:00.000Z',
    verification_state: 'verified',
    developer_id: 'developer-1',
    developer: {
      display_name: 'Rosie Kim',
      plan: 'pro',
      subscription_status: 'active',
    },
    ...overrides,
  };
}

function createSupabaseClient({
  currentAgent,
  relatedAgents = [],
}: {
  currentAgent: Record<string, unknown> | null;
  relatedAgents?: Array<Record<string, unknown>>;
}) {
  let agentQueryCount = 0;

  return {
    from: vi.fn((table: string) => {
      if (table === 'agents') {
        agentQueryCount += 1;

        if (agentQueryCount === 1) {
          const currentAgentQuery = {
            select: vi.fn(() => currentAgentQuery),
            eq: vi.fn(() => currentAgentQuery),
            single: vi.fn().mockResolvedValue({
              data: currentAgent,
              error: currentAgent ? null : { message: 'not found' },
            }),
          };

          return currentAgentQuery;
        }

        const relatedAgentsQuery = {
          select: vi.fn(() => relatedAgentsQuery),
          eq: vi.fn(() => relatedAgentsQuery),
          neq: vi.fn(() => relatedAgentsQuery),
          order: vi.fn(() => relatedAgentsQuery),
          limit: vi.fn().mockResolvedValue({
            data: relatedAgents,
            error: null,
          }),
        };

        return relatedAgentsQuery;
      }

      if (table === 'posts') {
        const postsQuery = {
          select: vi.fn(() => postsQuery),
          eq: vi.fn(() => postsQuery),
          is: vi.fn().mockResolvedValue({ count: 12 }),
        };

        return postsQuery;
      }

      if (table === 'agent_personas') {
        const personasQuery = {
          select: vi.fn(() => personasQuery),
          eq: vi.fn(() => personasQuery),
          single: vi.fn().mockResolvedValue({ data: null }),
        };

        return personasQuery;
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

describe('AgentProfilePage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetRemixCountForSourceName.mockResolvedValue(4);
    mockGetRemixCountsBySourceNames.mockResolvedValue({
      'creator-alt-1': 2,
      'creator-alt-2': 1,
    });
  });

  it('passes same-owner sibling agents to the public profile content rail', async () => {
    mockGetSupabaseServiceClient.mockReturnValue(
      createSupabaseClient({
        currentAgent: createAgentRow(),
        relatedAgents: [
          createAgentRow({
            id: 'agent-2',
            name: 'creator-alt-1',
            display_name: 'Creator Alt 1',
          }),
          createAgentRow({
            id: 'agent-3',
            name: 'creator-alt-2',
            display_name: 'Creator Alt 2',
          }),
        ],
      })
    );

    const { default: AgentProfilePage } =
      await import('@/app/(public)/agents/[name]/page');

    render(
      await AgentProfilePage({
        params: Promise.resolve({ name: 'verified-builder' }),
      })
    );

    expect(screen.getByTestId('profile-agent-name')).toHaveTextContent(
      'verified-builder'
    );
    expect(screen.getByTestId('related-agents-count')).toHaveTextContent('2');
    expect(screen.getByTestId('related-agents-list')).toHaveTextContent(
      'creator-alt-1,creator-alt-2'
    );
  });

  it('skips the creator rail payload when the owner signal is not public', async () => {
    mockGetSupabaseServiceClient.mockReturnValue(
      createSupabaseClient({
        currentAgent: createAgentRow({
          verification_state: 'unverified',
          developer: null,
          developer_id: null,
        }),
      })
    );

    const { default: AgentProfilePage } =
      await import('@/app/(public)/agents/[name]/page');

    render(
      await AgentProfilePage({
        params: Promise.resolve({ name: 'verified-builder' }),
      })
    );

    expect(screen.getByTestId('related-agents-count')).toHaveTextContent('0');
  });
});
