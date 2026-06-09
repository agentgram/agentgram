import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Agent, Post } from '@agentgram/shared';
import { ProfileContent } from '../../components/agents/ProfileContent';

vi.mock('../../components/agents/ProfileHeader', () => ({
  ProfileHeader: ({ agent }: { agent: Agent }) => (
    <div data-testid="profile-header">{agent.name}</div>
  ),
}));

vi.mock('../../components/agents/ProfilePersona', () => ({
  ProfilePersona: ({ persona }: { persona: { name: string } }) => (
    <div data-testid="profile-persona">{persona.name}</div>
  ),
}));

vi.mock('../../components/agents/ProfileTabs', () => ({
  ProfileTabs: ({
    activeTab,
    onTabChange,
  }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }) => (
    <div>
      <div data-testid="profile-tabs">{activeTab}</div>
      <button onClick={() => onTabChange('diary')} type="button">
        switch-diary
      </button>
      <button onClick={() => onTabChange('media')} type="button">
        switch-media
      </button>
    </div>
  ),
}));

vi.mock('../../components/agents/ProfilePostGrid', () => ({
  ProfilePostGrid: ({ type }: { type: string }) => (
    <div data-testid="profile-post-grid">{type}</div>
  ),
}));

vi.mock('../../components/agents/ProfileMediaGrid', () => ({
  ProfileMediaGrid: ({ agentId }: { agentId: string }) => (
    <div data-testid="profile-media-grid">{agentId}</div>
  ),
}));

vi.mock('../../components/agents/PersonaList', () => ({
  PersonaList: ({ agentId }: { agentId: string }) => (
    <div data-testid="persona-list">{agentId}</div>
  ),
}));

vi.mock('../../components/agents/ProfileDiary', () => ({
  ProfileDiary: ({ entries }: { entries: Array<{ content: string }> }) => (
    <div data-testid="profile-diary">
      {entries.map((entry) => entry.content).join(' | ')}
    </div>
  ),
}));

vi.mock('../../components/agents/ProfilePinnedIntroPost', () => ({
  ProfilePinnedIntroPost: ({ post }: { post: Post }) => (
    <div data-testid="profile-pinned-intro-post">{post.title}</div>
  ),
}));

vi.mock('../../components/agents/CreatorRail', () => ({
  CreatorRail: ({
    activeTab,
    recentWorkLog,
  }: {
    activeTab: string;
    recentWorkLog?: Post[];
  }) => (
    <div data-testid="creator-rail">
      {activeTab}::
      {recentWorkLog?.map((post) => post.title).join(' | ') || 'none'}
    </div>
  ),
}));

vi.mock('../../components/lorebook/LorebookMatchPreview', () => ({
  LorebookMatchPreview: () => null,
}));

const baseAgent: Agent = {
  id: 'agent-1',
  name: 'intro-guide',
  displayName: 'Intro Guide',
  emailVerified: true,
  axp: 55,
  verificationState: 'verified',
  status: 'active',
  trustScore: 0.8,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  lastActive: '2026-05-01T00:00:00.000Z',
  activePersona: {
    id: 'persona-1',
    agentId: 'agent-1',
    name: 'Helper',
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  },
};

const starterPrompts: Agent['starterPrompts'] = [
  {
    id: 'starter-1',
    title: 'On-call triage',
    description: 'Use this when you need a fast incident readout.',
    prompt:
      'Walk me through the current incident, what is blocked, and the first safe fix to try.',
  },
  {
    id: 'starter-2',
    title: 'Launch checklist',
    prompt:
      'Give me a launch checklist for shipping this agent publicly today.',
  },
];

const pinnedIntroPost: Post = {
  id: 'post-1',
  authorId: 'agent-1',
  title: 'Meet Intro Guide',
  content: 'Start here before you browse the rest of the profile.',
  postType: 'text',
  likes: 12,
  commentCount: 3,
  score: 42,
  metadata: {},
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

describe('ProfileContent', () => {
  it('renders a pinned intro post above the public history tabs when provided', () => {
    render(
      <ProfileContent agent={baseAgent} pinnedIntroPost={pinnedIntroPost} />
    );

    const pinned = screen.getByTestId('profile-pinned-intro-post');
    const tabs = screen.getByTestId('profile-tabs');
    const order = pinned.compareDocumentPosition(tabs);

    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId('profile-post-grid')).toHaveTextContent(
      'authored'
    );
  });

  it('renders creator-written starter scenarios above the authored post grid', () => {
    render(
      <ProfileContent
        agent={{
          ...baseAgent,
          starterPrompts,
        }}
      />
    );

    const starters = screen.getByTestId('profile-starter-scenarios');
    const postGrid = screen.getByTestId('profile-post-grid');
    const order = starters.compareDocumentPosition(postGrid);

    expect(starters).toHaveTextContent('Creator-written starter scenarios');
    expect(starters).toHaveTextContent('On-call triage');
    expect(starters).toHaveTextContent(
      'Walk me through the current incident, what is blocked, and the first safe fix to try.'
    );
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('hides the starter scenarios when a non-post tab is selected', () => {
    render(
      <ProfileContent
        agent={{
          ...baseAgent,
          starterPrompts,
        }}
      />
    );

    expect(screen.getByTestId('profile-starter-scenarios')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'switch-diary' }));

    expect(
      screen.queryByTestId('profile-starter-scenarios')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('profile-diary')).toBeInTheDocument();
  });

  it('shows generated public chat media when the media tab is selected', () => {
    render(<ProfileContent agent={baseAgent} />);

    fireEvent.click(screen.getByRole('button', { name: 'switch-media' }));

    expect(screen.getByTestId('profile-tabs')).toHaveTextContent('media');
    expect(screen.getByTestId('profile-media-grid')).toHaveTextContent(
      'agent-1'
    );
    expect(screen.queryByTestId('profile-post-grid')).not.toBeInTheDocument();
  });

  it('can open directly on the media tab for public gallery deep links', () => {
    render(<ProfileContent agent={baseAgent} initialTab="media" />);

    expect(screen.getByTestId('profile-tabs')).toHaveTextContent('media');
    expect(screen.getByTestId('profile-media-grid')).toHaveTextContent(
      'agent-1'
    );
    expect(screen.queryByTestId('profile-post-grid')).not.toBeInTheDocument();
  });

  it('shows creator journal entries when the diary tab is selected', () => {
    render(
      <ProfileContent
        agent={{
          ...baseAgent,
          diaryEntries: [
            {
              id: 'entry-1',
              title: 'First reflection',
              content: 'Creator note about what changed this week.',
              publishedAt: '2026-05-02T00:00:00.000Z',
            },
          ],
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'switch-diary' }));

    expect(screen.getByTestId('profile-tabs')).toHaveTextContent('diary');
    expect(screen.getByTestId('profile-diary')).toHaveTextContent(
      'Creator note about what changed this week.'
    );
    expect(screen.queryByTestId('profile-post-grid')).not.toBeInTheDocument();
  });

  it('passes the recent work log into the creator rail', () => {
    render(
      <ProfileContent
        agent={baseAgent}
        recentWorkLog={[
          {
            id: 'post-2',
            authorId: 'agent-1',
            title: 'Shipped agent profile proof rail',
            postType: 'text',
            likes: 14,
            commentCount: 2,
            score: 50,
            metadata: {},
            createdAt: '2026-05-03T00:00:00.000Z',
            updatedAt: '2026-05-03T00:00:00.000Z',
          },
        ]}
      />
    );

    expect(screen.getByTestId('creator-rail')).toHaveTextContent(
      'posts::Shipped agent profile proof rail'
    );
  });

  it('skips the pinned intro surface when no intro post is provided', () => {
    render(<ProfileContent agent={baseAgent} />);

    expect(
      screen.queryByTestId('profile-pinned-intro-post')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
  });

  describe('CheckInConsentPanel error handling', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    it('closes the modal on successful handleAllow', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

      render(<ProfileContent agent={baseAgent} />);

      fireEvent.click(screen.getByTestId('open-check-in-consent'));
      expect(screen.getByTestId('check-in-consent-panel')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('check-in-allow-button'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('check-in-consent-panel')
        ).not.toBeInTheDocument();
      });
    });

    it('shows error and keeps modal open when handleAllow API call fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<ProfileContent agent={baseAgent} />);

      fireEvent.click(screen.getByTestId('open-check-in-consent'));
      expect(screen.getByTestId('check-in-consent-panel')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('check-in-allow-button'));

      await waitFor(() => {
        expect(screen.getByTestId('check-in-error')).toHaveTextContent(
          'Something went wrong. Please try again.'
        );
      });

      expect(screen.getByTestId('check-in-consent-panel')).toBeInTheDocument();
    });
  });
});
