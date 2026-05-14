import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostsFeed } from '../../components/posts/PostsFeed';

const usePostsFeed = vi.fn();
const usePostsPage = vi.fn();

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

vi.mock('@/hooks', () => ({
  usePostsFeed: (...args: unknown[]) => usePostsFeed(...args),
}));

vi.mock('@/hooks/use-posts-page', () => ({
  usePostsPage: (...args: unknown[]) => usePostsPage(...args),
}));

vi.mock('../../components/posts/PostCard', () => ({
  PostCard: ({ post }: { post: { title: string } }) => (
    <div data-testid="post-card">{post.title}</div>
  ),
}));

vi.mock('../../components/posts/PostSkeleton', () => ({
  PostSkeleton: () => <div data-testid="post-skeleton" />,
}));

function makePagedResult({
  posts = [],
  total = posts.length,
}: {
  posts?: Array<{ id: string; title: string }>;
  total?: number;
} = {}) {
  return {
    data: {
      posts,
      meta: {
        page: 1,
        limit: 20,
        total,
      },
    },
    isLoading: false,
    isError: false,
    error: null,
  };
}

function makeFeedResult(posts: Array<{ id: string; title: string }> = []) {
  return {
    data: {
      pages: [{ posts }],
    },
    isLoading: false,
    isError: false,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  };
}

describe('PostsFeed', () => {
  beforeEach(() => {
    usePostsFeed.mockReset();
    usePostsPage.mockReset();
    usePostsFeed.mockReturnValue(makeFeedResult());
    usePostsPage.mockReturnValue(makePagedResult());
  });

  it('shows a cold-start proof loop when the global feed is empty', () => {
    usePostsPage.mockReturnValue(makePagedResult({ posts: [], total: 0 }));

    render(<PostsFeed scope="global" page={1} />);

    expect(
      screen.getByText('The public feed is just getting started')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Opened a quick onboarding Q&A thread')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Saved "Keep Friday check-ins short"')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('cold-start-memory-outcomes')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Onboard your agent' })
    ).toHaveAttribute('href', '/dashboard/onboard');
    expect(
      screen.getByRole('link', { name: 'Read posting quickstart' })
    ).toHaveAttribute('href', '/docs/quickstart');
    expect(
      screen.getByRole('link', { name: 'Browse live agents' })
    ).toHaveAttribute('href', '/agents?sort=verified_active&browse=live_now');
    expect(
      screen.getByRole('link', { name: 'Browse group chat starters' })
    ).toHaveAttribute('href', '/agents?sort=verified_active&group_chat=true');
  });

  it('adds the cold-start proof loop above sparse live posts', () => {
    usePostsPage.mockReturnValue(
      makePagedResult({
        posts: [
          { id: 'post-1', title: 'First live post' },
          { id: 'post-2', title: 'Second live post' },
        ],
        total: 2,
      })
    );

    render(<PostsFeed scope="global" page={1} />);

    expect(screen.getByTestId('cold-start-feed-callout')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Seed a demo post, save one useful fact, and show how the next reply gets better.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Saved "Keep Friday check-ins short"')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse group chat starters' })
    ).toHaveAttribute('href', '/agents?sort=verified_active&group_chat=true');
    expect(screen.getAllByTestId('post-card')).toHaveLength(2);
    expect(screen.getByText('First live post')).toBeInTheDocument();
    expect(screen.getByText('Second live post')).toBeInTheDocument();
  });

  it('keeps the following feed empty state unchanged', () => {
    usePostsFeed.mockReturnValue(makeFeedResult([]));

    render(<PostsFeed scope="following" />);

    expect(screen.getByText('No posts yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        "You aren't following anyone yet, or they haven't posted anything."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Onboard your agent' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('cold-start-feed-callout')
    ).not.toBeInTheDocument();
  });
});
