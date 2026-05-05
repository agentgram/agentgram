import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Agent } from '@agentgram/shared';
import { CreatorRail } from '../../components/agents/CreatorRail';

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
  verificationState: 'verified',
  status: 'active',
  trustScore: 0.92,
  publicOwnerLabel: 'Rosie Kim',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
  lastActive: '2026-04-03T00:00:00.000Z',
};

describe('CreatorRail', () => {
  it('renders creator surface jumps and switches tabs from the rail', () => {
    const onTabChange = vi.fn();

    render(
      <CreatorRail
        agent={{
          ...baseAgent,
          diaryEntries: [
            {
              id: 'entry-1',
              content: 'Shipped a new prompt pack.',
              publishedAt: '2026-05-01T00:00:00.000Z',
            },
          ],
        }}
        activeTab="posts"
        onTabChange={onTabChange}
      />
    );

    expect(
      screen.getByRole('complementary', { name: 'More from this creator' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('creator-rail-tab-posts')).toHaveTextContent(
      'Recent posts'
    );
    expect(screen.getByTestId('creator-rail-tab-diary')).toHaveTextContent(
      'Creator journal'
    );

    fireEvent.click(screen.getByTestId('creator-rail-tab-personas'));
    expect(onTabChange).toHaveBeenCalledWith('personas');
  });

  it('shows verified-owner proof and paid capability state for paid operators', () => {
    render(
      <CreatorRail
        agent={{
          ...baseAgent,
          operatorTier: 'pro',
        }}
        activeTab="posts"
        onTabChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('creator-rail-owner-proof')).toHaveTextContent(
      'Verified owner'
    );
    expect(screen.getByTestId('creator-rail-owner-proof')).toHaveTextContent(
      'Rosie Kim'
    );
    expect(
      screen.getByTestId('creator-rail-paid-capability')
    ).toHaveTextContent('Paid capability layer live');
    expect(
      screen.getByTestId('creator-rail-paid-tier-badge')
    ).toHaveTextContent('Pro');
    expect(
      screen.getByTestId('creator-rail-paid-capability-link')
    ).toHaveAttribute('href', '/pricing');
  });

  it('keeps owner proof hidden for unverified profiles and shows the upgrade teaser copy', () => {
    render(
      <CreatorRail
        agent={{
          ...baseAgent,
          verificationState: 'pending',
          publicOwnerLabel: undefined,
          operatorTier: undefined,
        }}
        activeTab="posts"
        onTabChange={vi.fn()}
      />
    );

    expect(
      screen.queryByTestId('creator-rail-owner-proof')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('creator-rail-paid-capability')
    ).toHaveTextContent('Paid capability teaser');
    expect(
      screen.getByTestId('creator-rail-paid-capability')
    ).toHaveTextContent(
      'Verify ownership first, then add paid proof like memory policy, permission scope, and work proof.'
    );
    expect(
      screen.getByTestId('creator-rail-paid-capability-link')
    ).toHaveTextContent('See paid capabilities');
  });
});
