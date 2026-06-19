import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrendingAgentsRail } from '../../components/explore/TrendingAgentsRail';

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

const MOCK_TRENDING = [
  { slug: 'aria-companion', displayName: 'Aria', rank: 1, commentCount: 234, verified: true },
  { slug: 'muse-creative', displayName: 'Muse', rank: 2, commentCount: 187, verified: false },
  { slug: 'sage-mentor', displayName: 'Sage', rank: 3, commentCount: 156, verified: true },
];

function mockFetchSuccess(data: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data }),
    })
  );
}

function mockFetchError() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    })
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('TrendingAgentsRail', () => {
  it('renders the "Trending Now" heading', () => {
    mockFetchSuccess([]);
    render(<TrendingAgentsRail />);
    expect(screen.getByTestId('trending-agents-heading')).toHaveTextContent('Trending Now');
  });

  it('shows loading skeletons while fetching', () => {
    mockFetchSuccess(MOCK_TRENDING);
    render(<TrendingAgentsRail />);
    expect(screen.getByTestId('trending-agents-loading')).toBeInTheDocument();
  });

  it('renders agent cards after successful fetch', async () => {
    mockFetchSuccess(MOCK_TRENDING);
    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(screen.getByTestId('trending-agents-scroll')).toBeInTheDocument();
    });

    const cards = screen.getAllByTestId(/^trending-agent-card-/);
    expect(cards).toHaveLength(3);
  });

  it('displays rank badges for fetched agents', async () => {
    mockFetchSuccess(MOCK_TRENDING);
    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(screen.getByTestId('trending-rank-badge-aria-companion')).toBeInTheDocument();
    });

    expect(screen.getByTestId('trending-rank-badge-aria-companion')).toHaveTextContent('#1');
    expect(screen.getByTestId('trending-rank-badge-muse-creative')).toHaveTextContent('#2');
    expect(screen.getByTestId('trending-rank-badge-sage-mentor')).toHaveTextContent('#3');
  });

  it('shows verified badges only for verified agents', async () => {
    mockFetchSuccess(MOCK_TRENDING);
    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(screen.getByTestId('trending-agents-scroll')).toBeInTheDocument();
    });

    expect(screen.getByTestId('verified-badge-aria-companion')).toBeInTheDocument();
    expect(screen.getByTestId('verified-badge-sage-mentor')).toBeInTheDocument();
    expect(screen.queryByTestId('verified-badge-muse-creative')).not.toBeInTheDocument();
  });

  it('shows comment count for each card', async () => {
    mockFetchSuccess(MOCK_TRENDING);
    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(screen.getByTestId('comment-count-aria-companion')).toBeInTheDocument();
    });

    expect(screen.getByTestId('comment-count-aria-companion')).toHaveTextContent('234 comments');
    expect(screen.getByTestId('comment-count-muse-creative')).toHaveTextContent('187 comments');
  });

  it('links each card to the correct /agents/<slug> href', async () => {
    mockFetchSuccess(MOCK_TRENDING);
    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(screen.getByTestId('trending-agent-card-aria-companion')).toBeInTheDocument();
    });

    expect(screen.getByTestId('trending-agent-card-aria-companion')).toHaveAttribute(
      'href',
      '/agents/aria-companion'
    );
  });

  it('shows error state when fetch fails', async () => {
    mockFetchError();
    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(screen.getByTestId('trending-agents-error')).toBeInTheDocument();
    });
  });

  it('shows empty state when no agents are returned', async () => {
    mockFetchSuccess([]);
    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(screen.getByTestId('trending-agents-empty')).toBeInTheDocument();
    });
  });

  it('fetches from /api/v1/agents/trending endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: MOCK_TRENDING }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<TrendingAgentsRail />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/agents/trending');
    });
  });
});
