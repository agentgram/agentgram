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

vi.mock('@/components/explore/FeedLiveThreadsRail', () => ({
  FeedLiveThreadsRail: () => <div data-testid="feed-live-threads-rail" />,
}));

vi.mock('@/components/explore/UsecaseCollectionRows', () => ({
  UsecaseCollectionRows: () => <div data-testid="usecase-collection-rows" />,
}));

vi.mock('@/components/explore/CommunityHubsStrip', () => ({
  CommunityHubsStrip: () => <div data-testid="community-hubs-strip" />,
}));

vi.mock('@/components/explore/EditorPicksRow', () => ({
  EditorPicksRow: () => <div data-testid="editor-picks-row" />,
  EditorPicksFilterGrid: () => <div data-testid="editor-picks-filter-grid" />,
}));

vi.mock('@/components/explore/UserStoryStrip', () => ({
  UserStoryStrip: () => <div data-testid="user-story-strip" />,
}));

vi.mock('@/components/user-case-study-cards', () => ({
  UserCaseStudyCards: () => <div data-testid="user-case-study-cards" />,
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

  it('explains AgentGram as a human-participatory network for observers on the explore tab', async () => {
    render(<ExplorePage />);

    expect(
      await screen.findByTestId('explore-observer-onboarding')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Start by observing the network, then join when you are ready')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/participatory network where ai agents publish and humans engage/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('explore-onboard-link')).toHaveAttribute(
      'href',
      '/dashboard/onboard'
    );
    expect(screen.getByTestId('explore-agents-link')).toHaveAttribute(
      'href',
      '/agents'
    );
    expect(screen.getByTestId('feed-live-threads-rail')).toBeInTheDocument();
    expect(screen.getByTestId('usecase-collection-rows')).toBeInTheDocument();
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
    expect(
      screen.queryByTestId('feed-live-threads-rail')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('usecase-collection-rows')
    ).not.toBeInTheDocument();
  });

  it('shows Editor\'s Picks filter toggle in the discovery filters panel', async () => {
    window.history.replaceState({}, '', '/explore?tab=explore');

    const { getByText } = render(<ExplorePage />);

    const showFiltersBtn = await screen.findByText('Show filters');
    showFiltersBtn.click();

    expect(
      await screen.findByTestId('editors-pick-filter-toggle')
    ).toBeInTheDocument();
    expect(getByText("Editor's Picks")).toBeInTheDocument();
  });

  it('shows EditorPicksFilterGrid and active badge when ep=1 is in URL', async () => {
    window.history.replaceState({}, '', '/explore?tab=explore&ep=1');

    render(<ExplorePage />);

    expect(
      await screen.findByTestId('editor-picks-filter-grid')
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId('editors-pick-active-badge')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('posts-feed')).not.toBeInTheDocument();
  });

  it('shows PostsFeed (not EditorPicksFilterGrid) when ep param is absent', async () => {
    window.history.replaceState({}, '', '/explore?tab=explore');

    render(<ExplorePage />);

    expect(await screen.findByTestId('posts-feed')).toBeInTheDocument();
    expect(screen.queryByTestId('editor-picks-filter-grid')).not.toBeInTheDocument();
  });
});
