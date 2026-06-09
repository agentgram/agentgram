import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@agentgram/shared';
import { ProfileMediaGrid } from '../../components/agents/ProfileMediaGrid';

const useAgentPostsMock = vi.fn();
const writeText = vi.fn();

vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ''} />
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
    personaName: 'Boardwalk Guide',
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
        personaName: 'Mirror Muse',
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
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  it('pins the latest generated scene above the gallery grid without duplicating it', () => {
    useAgentPostsMock.mockReturnValue({
      data: {
        pages: [
          {
            posts: [generatedMediaPost, uploadedMediaPost, chatSnippetPost],
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
    expect(screen.getByText('Creation gallery')).toBeInTheDocument();

    const spotlight = screen.getByTestId('profile-media-spotlight');
    expect(spotlight).toHaveTextContent('Latest spotlight');
    expect(spotlight).toHaveTextContent('Sunset boardwalk scene');
    expect(spotlight).toHaveTextContent('Boardwalk Guide');
    expect(spotlight).toHaveTextContent('3 public chat turns');
    expect(spotlight).toHaveTextContent(
      'Two friends meeting at a neon boardwalk at dusk.'
    );

    const gallery = screen.getByTestId('profile-media-gallery');
    expect(screen.getAllByTestId('profile-media-card')).toHaveLength(1);
    expect(
      within(gallery).getByText('Mirror selfie follow-up')
    ).toBeInTheDocument();
    expect(within(gallery).getByText('Mirror Muse')).toBeInTheDocument();
    expect(
      within(gallery).queryByText('Sunset boardwalk scene')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Manual upload')).not.toBeInTheDocument();
  });

  it('filters archived creations by persona and supports share and save actions', async () => {
    useAgentPostsMock.mockReturnValue({
      data: {
        pages: [
          {
            posts: [generatedMediaPost, uploadedMediaPost, chatSnippetPost],
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    });

    render(<ProfileMediaGrid agentId="agent-1" />);

    fireEvent.click(
      screen.getByTestId('profile-media-persona-filter-mirror-muse')
    );
    expect(screen.getByTestId('profile-media-gallery')).toHaveTextContent(
      '1 shown'
    );
    expect(screen.getByTestId('profile-media-gallery')).toHaveTextContent(
      'Mirror selfie follow-up'
    );

    fireEvent.click(
      screen.getByTestId('profile-media-persona-filter-boardwalk-guide')
    );
    expect(screen.getByTestId('profile-media-filter-empty')).toHaveTextContent(
      'No archived moments for this persona yet'
    );
    expect(screen.getByTestId('profile-media-spotlight')).toHaveTextContent(
      'Sunset boardwalk scene'
    );

    fireEvent.click(screen.getByTestId('profile-media-persona-filter-all'));
    const gallery = screen.getByTestId('profile-media-gallery');
    const saveButton = within(gallery).getByRole('button', {
      name: /save creation mirror selfie follow-up/i,
    });
    fireEvent.click(saveButton);
    expect(
      within(gallery).getByRole('button', {
        name: /remove saved creation mirror selfie follow-up/i,
      })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 saved')).toBeInTheDocument();

    fireEvent.click(
      within(gallery).getByRole('button', {
        name: /share creation mirror selfie follow-up/i,
      })
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-selfie')
    );
    expect(
      await within(gallery).findByRole('button', {
        name: /share creation mirror selfie follow-up/i,
      })
    ).toHaveTextContent('Copied');
  });

  it('shows a spotlight-only state when the first generated image lands', () => {
    useAgentPostsMock.mockReturnValue({
      data: {
        pages: [
          {
            posts: [chatSnippetPost, uploadedMediaPost],
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    });

    render(<ProfileMediaGrid agentId="agent-1" />);

    expect(screen.getByTestId('profile-media-spotlight')).toHaveTextContent(
      'Sunset boardwalk scene'
    );
    expect(
      screen.getByTestId('profile-media-spotlight-only')
    ).toHaveTextContent(
      'This spotlight is the first generated visual on the public profile.'
    );
    expect(screen.queryByTestId('profile-media-card')).not.toBeInTheDocument();
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
