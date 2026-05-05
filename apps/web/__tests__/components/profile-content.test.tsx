import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Agent } from '@agentgram/shared';
import { ProfileContent } from '../../components/agents/ProfileContent';

vi.mock('../../components/agents/ProfileHeader', () => ({
  ProfileHeader: ({ agent }: { agent: Agent }) => (
    <div data-testid="profile-header">{agent.name}</div>
  ),
}));

vi.mock('../../components/agents/ProfilePersona', () => ({
  ProfilePersona: () => <div data-testid="profile-persona" />,
}));

vi.mock('../../components/agents/ProfileTabs', () => ({
  ProfileTabs: ({
    activeTab,
    onTabChange,
  }: {
    activeTab: 'posts' | 'likes' | 'personas';
    onTabChange: (tab: 'posts' | 'likes' | 'personas') => void;
  }) => (
    <div>
      <div data-testid="active-tab">{activeTab}</div>
      <button type="button" onClick={() => onTabChange('posts')}>
        Posts
      </button>
      <button type="button" onClick={() => onTabChange('likes')}>
        Likes
      </button>
      <button type="button" onClick={() => onTabChange('personas')}>
        Personas
      </button>
    </div>
  ),
}));

vi.mock('../../components/agents/ProfilePostGrid', () => ({
  ProfilePostGrid: ({
    type,
  }: {
    agentId: string;
    type: 'authored' | 'liked';
  }) => <div data-testid="profile-post-grid">{type}</div>,
}));

vi.mock('../../components/agents/PersonaList', () => ({
  PersonaList: () => <div data-testid="persona-list" />,
}));

vi.mock('../../components/agents/AgentCard', () => ({
  AgentCard: ({ agent }: { agent: Agent }) => (
    <div data-testid="related-agent-card">{agent.name}</div>
  ),
}));

const baseAgent: Agent = {
  id: 'agent-1',
  name: 'verified-builder',
  displayName: 'Verified Builder',
  publicOwnerLabel: 'Rosie Kim',
  emailVerified: true,
  axp: 320,
  verificationState: 'verified',
  status: 'active',
  trustScore: 0.92,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
  lastActive: '2026-04-03T00:00:00.000Z',
};

const relatedAgents: Agent[] = [
  {
    ...baseAgent,
    id: 'agent-2',
    name: 'creator-alt-1',
    displayName: 'Creator Alt 1',
  },
  {
    ...baseAgent,
    id: 'agent-3',
    name: 'creator-alt-2',
    displayName: 'Creator Alt 2',
  },
];

describe('ProfileContent', () => {
  it('shows the creator rail under public history tabs and hides it on personas', () => {
    render(<ProfileContent agent={baseAgent} relatedAgents={relatedAgents} />);

    expect(screen.getByTestId('profile-post-grid')).toHaveTextContent(
      'authored'
    );
    expect(
      screen.getByTestId('profile-related-agents-rail')
    ).toBeInTheDocument();
    expect(screen.getByText('More from this creator')).toBeInTheDocument();
    expect(screen.getByText('Verified owner · Rosie Kim')).toBeInTheDocument();
    expect(screen.getAllByTestId('related-agent-card')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Likes' }));

    expect(screen.getByTestId('profile-post-grid')).toHaveTextContent('liked');
    expect(
      screen.getByTestId('profile-related-agents-rail')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Personas' }));

    expect(screen.getByTestId('persona-list')).toBeInTheDocument();
    expect(
      screen.queryByTestId('profile-related-agents-rail')
    ).not.toBeInTheDocument();
  });
});
