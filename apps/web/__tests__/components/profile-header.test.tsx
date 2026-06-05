/* eslint-disable @next/next/no-img-element */
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

    const accessDisclosure = screen.getByTestId('profile-external-tool-access');
    const followButton = screen.getByRole('button', { name: 'Follow' });

    expect(accessDisclosure).toBeInTheDocument();
    expect(
      screen.getByTestId('profile-external-tool-access-badge')
    ).toHaveTextContent('Repo Write');
    expect(accessDisclosure.compareDocumentPosition(followButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
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
    expect(
      screen.getByTestId('profile-external-tool-access-badge')
    ).toHaveTextContent('Read Only');
    expect(screen.getByTestId('permission-scope-badge')).toHaveTextContent(
      'Read Only'
    );
    expect(screen.queryByText('Capability summary')).not.toBeInTheDocument();
  });

  it('falls back to not disclosed external-tool access when permission scope is missing', () => {
    render(<ProfileHeader agent={baseAgent} />);

    expect(
      screen.getByTestId('profile-external-tool-access')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('profile-external-tool-access-status')
    ).toHaveTextContent('Not disclosed');
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
    expect(
      screen.getByTestId('profile-identity-claim-status')
    ).toHaveTextContent('Claimed and verified');
  });

  it('shows a public AI-agent identity card with claim status, API-safe domain, and owner proof', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          publicOwnerLabel: 'Ralph',
          identityCard: {
            claimStatus: 'claimed_verified',
            apiSafeHandle: '@verified-builder',
            apiSafeProfileUrl: 'https://agentgram.ai/agents/verified-builder',
            ownerProofLabel: 'Ralph',
          },
        }}
      />
    );

    expect(
      screen.getByRole('region', { name: 'AI-agent identity card' })
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('profile-identity-claim-status')
    ).toHaveTextContent('Claimed and verified');
    expect(screen.getByTestId('profile-identity-api-domain')).toHaveTextContent(
      'agentgram.ai/agents/verified-builder'
    );
    expect(screen.getByTestId('profile-identity-api-handle')).toHaveTextContent(
      '@verified-builder'
    );
    expect(
      screen.getByTestId('profile-identity-owner-proof')
    ).toHaveTextContent('Ralph');
  });

  it('shows unclaimed identity status without leaking private email or key metadata', () => {
    const { container } = render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          email: 'private-owner@example.com',
          publicKey: 'ag_secret_private_key',
          verificationState: 'unverified',
        }}
      />
    );

    expect(
      screen.getByTestId('profile-identity-claim-status')
    ).toHaveTextContent('Unclaimed');
    expect(screen.getByTestId('profile-identity-api-domain')).toHaveTextContent(
      'agentgram.ai/agents/verified-builder'
    );
    expect(
      screen.getByTestId('profile-identity-owner-proof-status')
    ).toHaveTextContent('Not published');
    expect(container).not.toHaveTextContent('private-owner@example.com');
    expect(container).not.toHaveTextContent('ag_secret_private_key');
  });

  it('renders a remix CTA and relationship mode badge when public persona metadata is present', () => {
    render(
      <ProfileHeader agent={{ ...baseAgent, relationshipPreset: 'partner' }} />
    );

    expect(screen.getByTestId('profile-relationship-badge')).toHaveTextContent(
      'Partner mode'
    );
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

  it('shows group chat support and max participants before the first reply for active profiles that support group chat', () => {
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

    expect(screen.getByTestId('profile-group-chat-disclosure')).toBeInTheDocument();
    expect(
      screen.getByTestId('profile-group-chat-support-badge')
    ).toHaveTextContent('Group chat ready');
    expect(
      screen.getByTestId('profile-group-chat-max-participants-badge')
    ).toHaveTextContent('Up to 3 participants');
    expect(screen.getByTestId('group-chat-starter-copy')).toHaveTextContent(
      /up to 3 participants before the first reply/i
    );
    expect(screen.getByTestId('group-chat-starter-link')).toHaveAttribute(
      'href',
      '/dashboard/onboard?remix=verified-builder&displayName=Verified+Builder&description=Builds+production+agents.&starter=group_chat'
    );
  });

  it('renders profile interest chips that open filtered explore subfeeds', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          description: 'Builds production agents. #AI',
          interestTags: ['robotics'],
        }}
      />
    );

    expect(screen.getByTestId('profile-interest-chips')).toBeInTheDocument();
    expect(
      screen.getByTestId('profile-interest-chip-robotics')
    ).toHaveAttribute('href', '/explore?tab=explore&tag=robotics');
    expect(screen.getByTestId('profile-interest-chip-ai')).toHaveAttribute(
      'href',
      '/explore?tab=explore&tag=ai'
    );
  });

  it('shows remix social proof in the profile stats when remixes exist', () => {
    render(<ProfileHeader agent={{ ...baseAgent, remixCount: 4 }} />);

    expect(screen.getByTestId('profile-remix-count')).toHaveTextContent(
      '4remixes'
    );
  });

  it('renders a character card-style share preview with a downloadable svg', () => {
    render(
      <ProfileHeader
        agent={{
          ...baseAgent,
          verificationState: 'verified',
          publicOwnerLabel: 'Ralph',
          relationshipPreset: 'mentor',
          capabilities: {
            voice: true,
            group_chat: true,
            roleplay: false,
          },
        }}
      />
    );

    expect(
      screen.getByRole('region', { name: 'Profile share card' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('profile-share-card-preview')).toHaveTextContent(
      'Verified Builder'
    );
    expect(screen.getByTestId('profile-share-card-preview')).toHaveTextContent(
      '@verified-builder'
    );
    expect(screen.getByTestId('profile-share-card-preview')).toHaveTextContent(
      'Mentor mode'
    );
    expect(screen.getByTestId('profile-share-card-preview')).toHaveTextContent(
      'Verified owner · Ralph'
    );
    expect(screen.getByTestId('profile-share-card-download')).toHaveAttribute(
      'download',
      'verified-builder-character-card.svg'
    );
    expect(screen.getByTestId('profile-share-card-download')).toHaveAttribute(
      'href',
      expect.stringContaining('data:image/svg+xml;charset=utf-8,')
    );
  });

  it('links the share card actions back to the public profile', () => {
    render(<ProfileHeader agent={baseAgent} />);

    expect(
      screen.getByTestId('profile-share-card-open-profile')
    ).toHaveAttribute('href', '/agents/verified-builder');
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

  it('renders the Request API Access button on every public profile', () => {
    render(<ProfileHeader agent={baseAgent} />);

    expect(
      screen.getByTestId('request-api-access-trigger')
    ).toBeInTheDocument();
    expect(screen.getByTestId('request-api-access-trigger')).toHaveTextContent(
      'Request API Access'
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
