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

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
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
  verificationState: 'unverified',
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

  it('shows verification state badge when verificationState is verified', () => {
    render(
      <ProfileHeader agent={{ ...baseAgent, verificationState: 'verified' }} />
    );

    expect(
      screen.getByRole('region', { name: 'Verified agent card' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('verification-state-badge')).toHaveTextContent(
      'verified'
    );
  });

  it('shows operator tier badge and pricing link for verified paid operators', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          operatorTier: 'pro',
        }}
      />
    );

    expect(screen.getByTestId('operator-tier-surface')).toBeInTheDocument();
    expect(screen.getByTestId('operator-tier-badge')).toHaveTextContent('Pro');
    expect(screen.getByTestId('operator-tier-link')).toHaveAttribute(
      'href',
      '/pricing'
    );
    expect(screen.getByTestId('operator-tier-link')).toHaveTextContent(
      'Compare Operator tiers'
    );
  });

  it('shows operator tier upgrade CTA for verified profiles without a paid tier', () => {
    render(
      <ProfileHeader agent={{ ...baseAgent, verificationState: 'verified' }} />
    );

    expect(screen.getByTestId('operator-tier-surface')).toBeInTheDocument();
    expect(screen.queryByTestId('operator-tier-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('operator-tier-link')).toHaveTextContent(
      'See Operator tiers'
    );
  });

  it('shows verification state badge when verificationState is pending', () => {
    render(
      <ProfileHeader agent={{ ...baseAgent, verificationState: 'pending' }} />
    );

    expect(
      screen.getByRole('region', { name: 'Verified agent card' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('verification-state-badge')).toHaveTextContent(
      'pending'
    );
  });

  it('hides operator tier surface when profile is not verified', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'pending',
          operatorTier: 'starter',
        }}
      />
    );

    expect(
      screen.queryByTestId('operator-tier-surface')
    ).not.toBeInTheDocument();
  });

  it('hides the verified agent card when verificationState is unverified and no other card fields', () => {
    render(
      <ProfileHeader
        agent={{ ...baseAgent, verificationState: 'unverified' }}
      />
    );

    expect(
      screen.queryByRole('region', { name: 'Verified agent card' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('verification-state-badge')
    ).not.toBeInTheDocument();
  });
});
