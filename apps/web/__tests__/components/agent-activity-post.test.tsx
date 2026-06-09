import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import {
  AgentActivityPost,
  type AgentActivityPostData,
} from '../../components/agents/AgentActivityPost';
import { AgentBetweenSessionFeed } from '../../components/agents/AgentBetweenSessionFeed';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

const baseAgent = {
  name: 'luna',
  displayName: 'Luna',
  avatarUrl: undefined as string | undefined,
};

const moodPost: AgentActivityPostData = {
  id: 'bsp-1',
  type: 'mood_update',
  text: 'Feeling reflective today 🌙',
  moodEmoji: '🌙',
  postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

const quotePost: AgentActivityPostData = {
  id: 'bsp-2',
  type: 'quote',
  text: '"The only way to do great work is to love what you do." — Steve Jobs',
  postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
};

const thoughtPost: AgentActivityPostData = {
  id: 'bsp-3',
  type: 'thought',
  text: 'Every conversation teaches me something new.',
  postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
};

// Pin Date.now so relative-time formatting is stable
const FIXED_NOW = new Date('2026-06-08T10:00:00Z').getTime();
beforeAll(() => {
  vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
});
afterAll(() => {
  vi.restoreAllMocks();
});

describe('AgentActivityPost', () => {
  it('renders mood_update post with text and emoji', () => {
    render(<AgentActivityPost agent={baseAgent} post={moodPost} />);

    expect(screen.getByTestId('agent-activity-post')).toBeInTheDocument();
    expect(screen.getByTestId('agent-activity-post-text')).toHaveTextContent(
      'Feeling reflective today 🌙'
    );
    expect(screen.getByTestId('agent-activity-post-emoji')).toHaveTextContent(
      '🌙'
    );
  });

  it('shows "posted spontaneously" label', () => {
    render(<AgentActivityPost agent={baseAgent} post={moodPost} />);

    expect(
      screen.getByTestId('agent-activity-post-label')
    ).toHaveTextContent('posted spontaneously');
  });

  it('shows correct type label for mood_update', () => {
    render(<AgentActivityPost agent={baseAgent} post={moodPost} />);

    expect(screen.getByTestId('agent-activity-post-type')).toHaveTextContent(
      'mood update'
    );
  });

  it('shows correct type label for quote', () => {
    render(<AgentActivityPost agent={baseAgent} post={quotePost} />);

    expect(screen.getByTestId('agent-activity-post-type')).toHaveTextContent(
      'quote'
    );
  });

  it('shows correct type label for thought', () => {
    render(<AgentActivityPost agent={baseAgent} post={thoughtPost} />);

    expect(screen.getByTestId('agent-activity-post-type')).toHaveTextContent(
      'thought'
    );
  });

  it('renders agent display name', () => {
    render(<AgentActivityPost agent={baseAgent} post={moodPost} />);

    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('renders avatar fallback initial when no avatarUrl', () => {
    render(<AgentActivityPost agent={baseAgent} post={moodPost} />);

    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('renders avatar img when avatarUrl is provided', () => {
    render(
      <AgentActivityPost
        agent={{ ...baseAgent, avatarUrl: 'https://example.com/luna.jpg' }}
        post={moodPost}
      />
    );

    const img = screen.getByRole('img', { name: 'Luna' });
    expect(img).toHaveAttribute('src', 'https://example.com/luna.jpg');
  });

  it('does not render emoji element when moodEmoji is absent', () => {
    render(<AgentActivityPost agent={baseAgent} post={quotePost} />);

    expect(
      screen.queryByTestId('agent-activity-post-emoji')
    ).not.toBeInTheDocument();
  });

  it('applies data-post-type attribute matching the post type', () => {
    render(<AgentActivityPost agent={baseAgent} post={moodPost} />);

    expect(screen.getByTestId('agent-activity-post')).toHaveAttribute(
      'data-post-type',
      'mood_update'
    );
  });
});

describe('AgentBetweenSessionFeed', () => {
  it('renders section heading with agent display name', () => {
    render(
      <AgentBetweenSessionFeed
        agent={baseAgent}
        posts={[moodPost, quotePost]}
      />
    );

    expect(
      screen.getByTestId('agent-between-session-feed')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Recent from Luna' })
    ).toBeInTheDocument();
  });

  it('renders all provided posts', () => {
    render(
      <AgentBetweenSessionFeed
        agent={baseAgent}
        posts={[moodPost, quotePost, thoughtPost]}
      />
    );

    expect(screen.getAllByTestId('agent-activity-post')).toHaveLength(3);
  });

  it('renders nothing when posts array is empty', () => {
    const { container } = render(
      <AgentBetweenSessionFeed agent={baseAgent} posts={[]} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to agent name when displayName is absent', () => {
    render(
      <AgentBetweenSessionFeed
        agent={{ name: 'luna', displayName: undefined, avatarUrl: undefined }}
        posts={[moodPost]}
      />
    );

    expect(
      screen.getByRole('region', { name: 'Recent from luna' })
    ).toBeInTheDocument();
  });
});
