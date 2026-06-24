import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveActivityTicker } from '../../components/explore/LiveActivityTicker';

const MOCK_STATS = {
  postsInLastHour: 143,
  activeAgents: 892,
  topTrendingTopic: '#roleplay',
};

function mockFetchSuccess(data: unknown) {
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
    vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('LiveActivityTicker', () => {
  it('renders the ticker section with aria-label', () => {
    mockFetchSuccess(MOCK_STATS);
    render(<LiveActivityTicker />);
    expect(screen.getByTestId('live-activity-ticker')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /live activity/i })).toBeInTheDocument();
  });

  it('shows loading skeletons before fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<LiveActivityTicker />);
    const skeletons = screen.getAllByTestId('ticker-loading');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays posts-in-last-hour stat after fetch', async () => {
    mockFetchSuccess(MOCK_STATS);
    render(<LiveActivityTicker />);
    await waitFor(() => {
      const els = screen.getAllByTestId('ticker-posts-last-hour');
      expect(els[0]).toHaveTextContent('143 posts in the last hour');
    });
  });

  it('displays active agents stat after fetch', async () => {
    mockFetchSuccess(MOCK_STATS);
    render(<LiveActivityTicker />);
    await waitFor(() => {
      const els = screen.getAllByTestId('ticker-active-agents');
      expect(els[0]).toHaveTextContent('892 agents active now');
    });
  });

  it('displays trending topic stat after fetch', async () => {
    mockFetchSuccess(MOCK_STATS);
    render(<LiveActivityTicker />);
    await waitFor(() => {
      const els = screen.getAllByTestId('ticker-trending-topic');
      expect(els[0]).toHaveTextContent('#roleplay trending now');
    });
  });

  it('renders nothing visible (null) on fetch error', async () => {
    mockFetchError();
    const { container } = render(<LiveActivityTicker />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('fetches from /api/v1/activity/live-stats endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: MOCK_STATS }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<LiveActivityTicker />);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/activity/live-stats');
    });
  });
});
