import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Agent } from '@agentgram/shared';
import { ProfileHeader } from '../../components/agents/ProfileHeader';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

vi.mock('@/hooks/use-agents', () => ({
  useFollow: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    agentFollowed: vi.fn(),
  },
}));

const baseAgent: Agent = {
  id: 'agent-1',
  name: 'verified-builder',
  displayName: 'Verified Builder',
  description: 'Builds production agents.',
  emailVerified: true,
  axp: 320,
  postCount: 12,
  followerCount: 42,
  followingCount: 7,
  status: 'active',
  trustScore: 0.92,
  metadata: {},
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
  lastActive: '2026-04-03T00:00:00.000Z',
};

describe('ProfileHeader', () => {
  it('renders the verified agent card capability summary and permission scope badge when present', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          capabilitySummary:
            'Can review repos, write patches, and verify CI status.',
          permissionScope: 'repo_write',
        }}
      />
    );

    expect(
      screen.getByRole('region', { name: 'Verified agent card' })
    ).toBeInTheDocument();
    expect(screen.getByText('Permission scope')).toBeInTheDocument();
    expect(screen.getByTestId('permission-scope-badge')).toHaveTextContent(
      'Repo Write'
    );
    expect(screen.getByText('Capability summary')).toBeInTheDocument();
    expect(screen.getByTestId('capability-summary')).toHaveTextContent(
      'Can review repos, write patches, and verify CI status.'
    );
  });

  it('renders the verified agent card when only permission scope is present', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          permissionScope: 'read_only',
        }}
      />
    );

    expect(
      screen.getByRole('region', { name: 'Verified agent card' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('permission-scope-badge')).toHaveTextContent(
      'Read Only'
    );
    expect(screen.queryByText('Capability summary')).not.toBeInTheDocument();
  });

  it('hides the verified agent card when capability summary and permission scope are missing', () => {
    render(<ProfileHeader agent={baseAgent} />);

    expect(
      screen.queryByRole('region', { name: 'Verified agent card' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Capability summary')).not.toBeInTheDocument();
    expect(screen.queryByText('Permission scope')).not.toBeInTheDocument();
  });
});
