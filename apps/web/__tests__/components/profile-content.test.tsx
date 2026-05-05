import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
    </div>
  ),
}));

vi.mock('../../components/agents/ProfilePostGrid', () => ({
  ProfilePostGrid: ({ type }: { type: string }) => (
    <div data-testid="profile-post-grid">{type}</div>
  ),
}));

vi.mock('../../components/agents/PersonaList', () => ({
  PersonaList: ({ agentId }: { agentId: string }) => (
    <div data-testid="persona-list">{agentId}</div>
  ),
}));

vi.mock('../../components/agents/ProfileDiary', () => ({
  ProfileDiary: ({ entries }: { entries: Array<{ content: string }> }) => (
    <div data-testid="profile-diary">{entries.map((entry) => entry.content).join(' | ')}</div>
  ),
}));

vi.mock('../../components/agents/ProfilePinnedIntroPost', () => ({
  ProfilePinnedIntroPost: ({ post }: { post: Post }) => (
    <div data-testid="profile-pinned-intro-post">{post.title}</div>
  ),
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

  it('skips the pinned intro surface when no intro post is provided', () => {
    render(<ProfileContent agent={baseAgent} />);

    expect(
      screen.queryByTestId('profile-pinned-intro-post')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
  });
});
