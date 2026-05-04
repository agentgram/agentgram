import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
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
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
  lastActive: '2026-04-03T00:00:00.000Z',
};

describe('ProfileHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T05:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('renders a remix CTA that deep-links into onboarding with public persona context', () => {
    render(<ProfileHeader agent={baseAgent} />);

    expect(screen.getByTestId('remix-agent-link')).toHaveAttribute(
      'href',
      '/dashboard/onboard?remix=verified-builder&displayName=Verified+Builder&description=Builds+production+agents.'
    );
    expect(
      screen.getByText(/start from this public persona/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('group-chat-starter-link')
    ).not.toBeInTheDocument();
  });

  it('shows a group chat starter CTA for active profiles that support group chat', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          capabilities: {
            voice: false,
            group_chat: true,
            roleplay: false,
          },
        }}
      />
    );

    expect(screen.getByTestId('group-chat-starter-link')).toHaveAttribute(
      'href',
      '/dashboard/onboard?remix=verified-builder&displayName=Verified+Builder&description=Builds+production+agents.&starter=group_chat'
    );
    expect(screen.getByTestId('group-chat-starter-copy')).toHaveTextContent(
      /group conversation and multi-agent intros/i
    );
  });

  it('shows remix social proof in the profile stats when remixes exist', () => {
    render(<ProfileHeader agent={{ ...baseAgent, remixCount: 4 }} />);

    expect(screen.getByTestId('profile-remix-count')).toHaveTextContent(
      '4remixes'
    );
  });

  it('shows public trust bundle details for verified profiles', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          publicOwnerLabel: 'Ralph',
          memoryPolicy: 'ephemeral_only',
          lastActive: '2026-04-28T02:30:00.000Z',
        }}
      />
    );

    expect(
      screen.getByTestId('profile-public-trust-bundle')
    ).toBeInTheDocument();
    expect(screen.getByTestId('profile-owner-label')).toHaveTextContent(
      'Ralph'
    );
    expect(
      screen.getByTestId('profile-memory-consent-badge')
    ).toHaveTextContent('Ephemeral Only');
    expect(screen.getByTestId('profile-last-active-badge')).toHaveTextContent(
      'Active today'
    );
  });

  it('shows operator trust bundle and pricing link for verified paid operators', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          operatorTier: 'pro',
          permissionScope: 'repo_write',
          capabilitySummary: 'Publishes shipping notes and CI receipts.',
          memoryPolicy: 'ephemeral_only',
          workProofUrl: 'https://example.com/proof',
          workProofLabel: 'Review work proof',
          capabilities: {
            voice: true,
            group_chat: true,
            roleplay: false,
          },
        }}
      />
    );

    expect(screen.getByTestId('operator-tier-surface')).toBeInTheDocument();
    expect(
      screen.queryByTestId('paid-chat-capabilities-surface')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('operator-tier-badge')).toHaveTextContent('Pro');
    expect(screen.getByTestId('operator-trust-bundle')).toBeInTheDocument();
    expect(screen.getByTestId('memory-policy-badge')).toHaveTextContent(
      'Ephemeral Only'
    );
    expect(
      screen.getByTestId('operator-permission-scope-badge')
    ).toHaveTextContent('Repo Write');
    expect(screen.getByTestId('work-proof-link')).toHaveAttribute(
      'href',
      'https://example.com/proof'
    );
    expect(screen.getByTestId('work-proof-link')).toHaveTextContent(
      'Review work proof'
    );
    expect(screen.getByTestId('operator-tier-link')).toHaveAttribute(
      'href',
      '/pricing'
    );
    expect(screen.getByTestId('operator-tier-link')).toHaveTextContent(
      'Compare Operator tiers'
    );
    expect(
      screen.queryByTestId('permission-scope-badge')
    ).not.toBeInTheDocument();
  });

  it('hides operator tier upsell before the first successful reply for verified profiles without a paid tier', () => {
    render(
      <ProfileHeader agent={{ ...baseAgent, verificationState: 'verified' }} />
    );

    expect(
      screen.queryByTestId('operator-tier-surface')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('operator-trust-bundle')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('operator-tier-link')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('paid-chat-capabilities-surface')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('verification-state-badge')).toHaveTextContent(
      'verified'
    );
  });

  it('labels paid-only chat capabilities before the first successful reply for verified profiles without a paid tier', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          capabilities: {
            voice: true,
            group_chat: true,
            roleplay: false,
          },
        }}
      />
    );

    expect(
      screen.getByTestId('paid-chat-capabilities-surface')
    ).toBeInTheDocument();
    expect(screen.getByTestId('paid-chat-capabilities-copy')).toHaveTextContent(
      /before the first message/i
    );
    expect(
      screen.getByTestId('paid-chat-capability-badge-voice')
    ).toHaveTextContent('Voice · Paid only');
    expect(
      screen.getByTestId('paid-chat-capability-badge-group_chat')
    ).toHaveTextContent('Group chat · Paid only');
    expect(
      screen.queryByTestId('paid-chat-capability-badge-roleplay')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('operator-tier-surface')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('operator-tier-link')).not.toBeInTheDocument();
  });

  it('shows operator tier upgrade CTA after the first successful reply for verified profiles without a paid tier', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          hasFirstSuccessfulReply: true,
          capabilities: {
            voice: true,
            group_chat: true,
            roleplay: false,
          },
        }}
      />
    );

    expect(screen.getByTestId('operator-tier-surface')).toBeInTheDocument();
    expect(
      screen.queryByTestId('paid-chat-capabilities-surface')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('operator-trust-bundle')).toBeInTheDocument();
    expect(screen.queryByTestId('operator-tier-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('memory-policy-status')).toHaveTextContent(
      'Add memory policy'
    );
    expect(
      screen.getByTestId('operator-permission-scope-status')
    ).toHaveTextContent('Add permission scope');
    expect(screen.getByTestId('work-proof-status')).toHaveTextContent(
      'Add work proof'
    );
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

  it('renders privacy controls with retention and training disclosures when present', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          retentionPolicy: '30_days',
          trainingEnabled: false,
        }}
      />
    );

    expect(
      screen.getByRole('region', { name: 'Privacy controls' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('retention-disclosure-badge')).toHaveTextContent(
      '30 Days'
    );
    expect(screen.getByTestId('training-disclosure-badge')).toHaveTextContent(
      'Not Used For Training'
    );
    expect(screen.getByTestId('privacy-controls-link')).toHaveAttribute(
      'href',
      '/privacy'
    );
  });

  it('shows not disclosed states when privacy controls are missing', () => {
    render(<ProfileHeader agent={baseAgent} />);

    expect(
      screen.getByRole('region', { name: 'Privacy controls' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('retention-disclosure-status')).toHaveTextContent(
      'Not disclosed'
    );
    expect(screen.getByTestId('training-disclosure-status')).toHaveTextContent(
      'Not disclosed'
    );
  });

  it('uses capability summary as work-proof fallback when no external proof is linked after the first successful reply', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          capabilitySummary: 'Shares benchmark notes and shipping receipts.',
          hasFirstSuccessfulReply: true,
        }}
      />
    );

    expect(screen.getByTestId('operator-tier-surface')).toBeInTheDocument();
    expect(screen.getByTestId('work-proof-status')).toHaveTextContent(
      'Capability summary on profile'
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
