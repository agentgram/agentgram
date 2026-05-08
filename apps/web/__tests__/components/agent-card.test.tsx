/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentCard } from '../../components/agents/AgentCard';

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

describe('AgentCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T05:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a freshness badge for recently active agents without hiding the new badge', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-1',
          name: 'night-ops',
          displayName: 'Night Ops',
          axp: 1200,
          createdAt: '2026-04-27T12:00:00.000Z',
          lastActive: '2026-04-28T02:30:00.000Z',
        }}
        showNewBadge
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByTestId('agent-card-freshness-badge')).toHaveTextContent(
      'Active today'
    );
  });

  it('shows compact relative freshness copy for agents active within the past week', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-2',
          name: 'steady-builder',
          displayName: 'Steady Builder',
          axp: 845,
          lastActive: '2026-04-25T05:00:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('agent-card-freshness-badge')).toHaveTextContent(
      'Active 3d ago'
    );
  });

  it('shows reply modality badges before the remaining capability chips', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-3',
          name: 'storyteller',
          axp: 1200,
          relationshipPreset: 'mentor',
          capabilities: {
            voice: true,
            video: true,
            image: true,
            web: true,
            group_chat: true,
            roleplay: false,
          },
        }}
      />
    );

    const modalityStrip = screen.getByTestId('agent-card-modality-badges');

    expect(screen.getByTestId('agent-relationship-badge')).toHaveTextContent(
      'Mentor mode'
    );
    expect(
      screen.getByTestId('agent-card-modality-badge-voice')
    ).toHaveTextContent('Voice');
    expect(
      screen.getByTestId('agent-card-modality-badge-video')
    ).toHaveTextContent('Video');
    expect(
      screen.getByTestId('agent-card-modality-badge-image')
    ).toHaveTextContent('Image');
    expect(
      screen.getByTestId('agent-card-modality-badge-web')
    ).toHaveTextContent('Web-aware');
    expect(
      screen.queryByTestId('agent-capability-badge-voice')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('agent-capability-badge-group_chat')
    ).toHaveTextContent('Group chat');
    expect(
      modalityStrip.compareDocumentPosition(
        screen.getByTestId('agent-capability-badge-group_chat')
      ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      screen.queryByTestId('agent-capability-badge-roleplay')
    ).not.toBeInTheDocument();
  });

  it('shows remix social proof when remix count is available', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-3b',
          name: 'builder-remix-source',
          displayName: 'Builder Remix Source',
          axp: 1200,
          remixCount: 3,
        }}
      />
    );

    expect(screen.getByTestId('agent-card-remix-count')).toHaveTextContent(
      '3 remixes'
    );
  });

  it('shows paid-only and 18+ trust badges before opening the profile', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-3c',
          name: 'night-club-guide',
          displayName: 'Night Club Guide',
          axp: 980,
          operatorTier: 'pro',
          matureContent: true,
        }}
      />
    );

    expect(screen.getByTestId('agent-card-trust-strip')).toBeInTheDocument();
    expect(screen.getByTestId('agent-card-trust-badge-paid')).toHaveTextContent(
      'Paid-only chat'
    );
    expect(
      screen.getByTestId('agent-card-trust-badge-mature')
    ).toHaveTextContent('18+');
  });

  it('groups verified owner, memory consent, and last activity into a public trust bundle for verified agents', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-trust',
          name: 'trust-builder',
          displayName: 'Trust Builder',
          axp: 2400,
          verificationState: 'verified',
          publicOwnerLabel: 'Ralph',
          memoryPolicy: 'ephemeral_only',
          lastActive: '2026-04-28T02:30:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('agent-card-trust-bundle')).toBeInTheDocument();
    expect(screen.getByTestId('agent-card-owner-label')).toHaveTextContent(
      'Verified owner: Ralph'
    );
    expect(screen.getByTestId('agent-card-memory-consent')).toHaveTextContent(
      'Memory consent: Ephemeral Only'
    );
    expect(
      screen.getByTestId('agent-card-trust-last-active')
    ).toHaveTextContent('Active today');
    expect(
      screen.queryByTestId('agent-card-freshness-badge')
    ).not.toBeInTheDocument();
  });

  it('omits the freshness badge when last active data is missing', () => {
    render(
      <AgentCard
        agent={{
          id: 'agent-4',
          name: 'quiet-mode',
          displayName: 'Quiet Mode',
          axp: 88,
        }}
      />
    );

    expect(
      screen.queryByTestId('agent-card-freshness-badge')
    ).not.toBeInTheDocument();
  });
});
