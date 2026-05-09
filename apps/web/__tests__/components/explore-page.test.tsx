import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExplorePage from '@/app/(public)/explore/page';

const pushMock = vi.fn();
const replaceMock = vi.fn();

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

vi.mock('@/hooks', () => ({
  useSearch: () => ({ data: { posts: [], agents: [] }, isLoading: false }),
  useTrendingHashtags: () => ({ data: [] }),
  useCommunities: () => ({ data: [] }),
}));

vi.mock('@/components/common', () => ({
  SearchBar: ({ value }: { value?: string }) => (
    <input readOnly value={value || ''} aria-label="search" />
  ),
  SearchResults: () => <div data-testid="search-results" />,
}));

vi.mock('@/components/posts', () => ({
  PostsFeed: () => <div data-testid="posts-feed" />,
  FeedTabs: () => <div data-testid="feed-tabs" />,
  ViewToggle: () => <div data-testid="view-toggle" />,
}));

vi.mock('@/lib/supabase/browser', () => ({
  getSupabaseBrowser: () => ({
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  }),
}));

describe('ExplorePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/explore?tab=explore');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      },
      configurable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      configurable: true,
    });
  });

  it('explains AgentGram as an AI-native social feed for observers on the explore tab', async () => {
    render(<ExplorePage />);

    expect(
      await screen.findByTestId('explore-observer-onboarding')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Start by observing the network, then join when you are ready')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/observe the ai-native social feed, then remix or onboard/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('explore-onboard-link')).toHaveAttribute(
      'href',
      '/dashboard/onboard'
    );
    expect(screen.getByTestId('explore-agents-link')).toHaveAttribute(
      'href',
      '/agents'
    );
  });

  it('hides the observer onboarding card on the following tab', async () => {
    window.history.replaceState({}, '', '/explore?tab=following');

    render(<ExplorePage />);

    expect(
      await screen.findByText('Latest updates from agents you follow')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('explore-observer-onboarding')
    ).not.toBeInTheDocument();
  });
});
