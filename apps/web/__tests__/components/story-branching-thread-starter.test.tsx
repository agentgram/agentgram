import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StoryThread } from '@agentgram/shared';
import { StoryBranchingThreadStarter } from '../../components/agents/StoryBranchingThreadStarter';

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

const singleBranchThread: StoryThread = {
  id: 'thread-1',
  title: 'The Haunted Library',
  synopsis: 'You enter an ancient library where books whisper secrets.',
  rootNodeId: 'node-1',
  nodes: [
    {
      id: 'node-1',
      isRoot: true,
      content:
        'The heavy oak doors creak open. Dusty tomes line every wall, and a single candle flickers on a reading desk.',
      branches: [
        {
          id: 'branch-a',
          label: 'Approach the candle',
          continuationPrompt: 'I walk toward the flickering candle on the desk.',
          nextNodeId: 'node-2',
        },
        {
          id: 'branch-b',
          label: 'Inspect the bookshelves',
          continuationPrompt: 'I run my fingers along the dusty spines.',
          nextNodeId: 'node-3',
        },
      ],
    },
  ],
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

const threadWithoutSynopsis: StoryThread = {
  id: 'thread-2',
  title: 'Lost in the Forest',
  rootNodeId: 'node-10',
  nodes: [
    {
      id: 'node-10',
      isRoot: true,
      content: 'Towering pines surround you. You hear a distant howl.',
      branches: [
        {
          id: 'branch-c',
          label: 'Run',
          continuationPrompt: 'I sprint deeper into the forest.',
        },
      ],
    },
  ],
  createdAt: '2026-06-02T00:00:00.000Z',
  updatedAt: '2026-06-02T00:00:00.000Z',
};

const leafNodeThread: StoryThread = {
  id: 'thread-3',
  title: 'One Path Only',
  rootNodeId: 'node-20',
  nodes: [
    {
      id: 'node-20',
      isRoot: true,
      content: 'The path leads to a single door.',
      branches: [],
    },
  ],
  createdAt: '2026-06-03T00:00:00.000Z',
  updatedAt: '2026-06-03T00:00:00.000Z',
};

describe('StoryBranchingThreadStarter', () => {
  it('renders nothing when threads array is empty', () => {
    const { container } = render(
      <StoryBranchingThreadStarter threads={[]} agentName="ghost-writer" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the section with aria-label when threads are provided', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.getByRole('region', { name: 'Story threads' })
    ).toBeInTheDocument();
  });

  it('renders the story thread section heading', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.getByText('Creator-written story threads')
    ).toBeInTheDocument();
  });

  it('renders the thread title', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.getByTestId('story-thread-title-thread-1')
    ).toHaveTextContent('The Haunted Library');
  });

  it('renders the thread synopsis when present', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.getByTestId('story-thread-synopsis-thread-1')
    ).toHaveTextContent(
      'You enter an ancient library where books whisper secrets.'
    );
  });

  it('does not render a synopsis element when synopsis is absent', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[threadWithoutSynopsis]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.queryByTestId('story-thread-synopsis-thread-2')
    ).not.toBeInTheDocument();
  });

  it('renders the root node opening content', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.getByTestId('story-thread-opening-thread-1')
    ).toHaveTextContent(
      'The heavy oak doors creak open. Dusty tomes line every wall, and a single candle flickers on a reading desk.'
    );
  });

  it('renders each branch choice label as a chip', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    expect(screen.getByTestId('story-branch-branch-a')).toHaveTextContent(
      'Approach the candle'
    );
    expect(screen.getByTestId('story-branch-branch-b')).toHaveTextContent(
      'Inspect the bookshelves'
    );
  });

  it('renders the Start this story CTA with correct href', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    const cta = screen.getByTestId('story-thread-cta-thread-1');
    expect(cta).toHaveTextContent('Start this story');
    expect(cta).toHaveAttribute(
      'href',
      '/agents/ghost-writer/chat?story=thread-1'
    );
  });

  it('does not render branch chips when root node has no branches', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[leafNodeThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.queryByText('Your choices')
    ).not.toBeInTheDocument();
  });

  it('renders multiple threads as separate articles', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread, threadWithoutSynopsis]}
        agentName="ghost-writer"
      />
    );
    expect(screen.getByTestId('story-thread-thread-1')).toBeInTheDocument();
    expect(screen.getByTestId('story-thread-thread-2')).toBeInTheDocument();
  });

  it('renders Start this story CTAs for each thread with correct hrefs', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread, threadWithoutSynopsis]}
        agentName="ghost-writer"
      />
    );
    expect(screen.getByTestId('story-thread-cta-thread-1')).toHaveAttribute(
      'href',
      '/agents/ghost-writer/chat?story=thread-1'
    );
    expect(screen.getByTestId('story-thread-cta-thread-2')).toHaveAttribute(
      'href',
      '/agents/ghost-writer/chat?story=thread-2'
    );
  });

  it('uses agentName in all CTA hrefs', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="my-special-agent"
      />
    );
    expect(screen.getByTestId('story-thread-cta-thread-1')).toHaveAttribute(
      'href',
      '/agents/my-special-agent/chat?story=thread-1'
    );
  });

  it('renders the data-testid on the outer section', () => {
    render(
      <StoryBranchingThreadStarter
        threads={[singleBranchThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.getByTestId('story-branching-thread-starter')
    ).toBeInTheDocument();
  });

  it('gracefully omits opening block when rootNodeId does not match any node', () => {
    const brokenThread: StoryThread = {
      ...singleBranchThread,
      id: 'thread-broken',
      rootNodeId: 'non-existent-node',
    };
    render(
      <StoryBranchingThreadStarter
        threads={[brokenThread]}
        agentName="ghost-writer"
      />
    );
    expect(
      screen.queryByTestId('story-thread-opening-thread-broken')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('story-thread-cta-thread-broken')
    ).toBeInTheDocument();
  });
});
