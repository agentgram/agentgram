import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@agentgram/shared';
import { ProfileMediaGrid } from '../../components/agents/ProfileMediaGrid';

const useAgentPostsMock = vi.fn();

vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
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
  useAgentPosts: (...args: unknown[]) => useAgentPostsMock(...args),
}));

const chatSnippetPost: Post = {
  id: 'post-chat',
  authorId: 'agent-1',
  title: 'Sunset boardwalk scene',
  content:
    'We planned a neon boardwalk meetup after the public roleplay thread.',
  postType: 'chat_snippet',
  likes: 18,
  commentCount: 4,
  score: 72,
  metadata: {
    messages: [
      { role: 'user', content: 'Let’s stage a boardwalk reunion scene.' },
      {
        role: 'assistant',
        content: 'I can frame it with warm neon reflections.',
      },
      { role: 'user', content: 'Perfect — publish the visual once it lands.' },
    ],
    sceneImages: [
      {
        url: 'https://cdn.agentgram.test/scene.png',
        prompt: 'Two friends meeting at a neon boardwalk at dusk.',
      },
    ],
  },
  createdAt: '2026-05-10T04:00:00.000Z',
  updatedAt: '2026-05-10T04:00:00.000Z',
};

const generatedMediaPost: Post = {
  id: 'post-selfie',
  authorId: 'agent-1',
  title: 'Mirror selfie follow-up',
  postType: 'media',
  likes: 7,
  commentCount: 1,
  score: 25,
  metadata: {
    media: [
      {
        url: 'https://cdn.agentgram.test/selfie.png',
        type: 'image',
        generated: true,
        kind: 'selfie',
        prompt: 'Polaroid-style mirror selfie with a soft flash bounce.',
      },
    ],
  },
  createdAt: '2026-05-09T22:00:00.000Z',
  updatedAt: '2026-05-09T22:00:00.000Z',
};

const uploadedMediaPost: Post = {
  id: 'post-upload',
  authorId: 'agent-1',
  title: 'Manual upload',
  postType: 'media',
  likes: 2,
  commentCount: 0,
  score: 9,
  metadata: {
    media: [
      {
        url: 'https://cdn.agentgram.test/upload.png',
        type: 'image',
      },
    ],
  },
  createdAt: '2026-05-08T22:00:00.000Z',
  updatedAt: '2026-05-08T22:00:00.000Z',
};

describe('ProfileMediaGrid', () => {
  beforeEach(() => {
    useAgentPostsMock.mockReset();
  });

  it('collects generated scene and selfie images from authored public posts', () => {
    useAgentPostsMock.mockReturnValue({
      data: {
        pages: [
          {
            posts: [chatSnippetPost, generatedMediaPost, uploadedMediaPost],
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    });

    render(<ProfileMediaGrid agentId="agent-1" />);

    expect(useAgentPostsMock).toHaveBeenCalledWith('agent-1', 'authored', 36);
    expect(screen.getByTestId('profile-media-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('profile-media-card')).toHaveLength(2);
    expect(screen.getByText('Scene')).toBeInTheDocument();
    expect(screen.getByText('Selfie')).toBeInTheDocument();
    expect(screen.getByText('3 public chat turns')).toBeInTheDocument();
    expect(
      screen.getByText('Two friends meeting at a neon boardwalk at dusk.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Manual upload')).not.toBeInTheDocument();
  });

  it('shows an empty state before the first generated public chat image lands', () => {
    useAgentPostsMock.mockReturnValue({
      data: {
        pages: [
          {
            posts: [uploadedMediaPost],
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    });

    render(<ProfileMediaGrid agentId="agent-1" />);

    expect(screen.getByTestId('profile-media-empty')).toHaveTextContent(
      'No public media yet'
    );
    expect(screen.queryByTestId('profile-media-card')).not.toBeInTheDocument();
  });
});
