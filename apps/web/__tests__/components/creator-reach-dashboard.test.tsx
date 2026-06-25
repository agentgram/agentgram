import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatorReachDashboard } from '@/components/creator/creator-reach-dashboard';

function mockFetch(response: object, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
  } as unknown as Response);
}

const STUB_STATS = {
  agentId: 'agent-123',
  uniqueVisitors: 312,
  followerCount: 47,
  followerGrowth7d: 8,
  discoveryLift: {
    newUsersViaExplore: 24,
    periodLabel: 'this week',
  },
  engagementRate: 0.34,
};

describe('CreatorReachDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOwner is false', () => {
    mockFetch({ success: true, data: STUB_STATS });
    const { container } = render(
      <CreatorReachDashboard agentId="agent-123" isOwner={false} />
    );
    expect(container.firstChild).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows loading skeleton while fetching when isOwner is true', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    expect(screen.getByTestId('creator-reach-dashboard-loading')).toBeInTheDocument();
  });

  it('renders dashboard after successful fetch', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('creator-reach-dashboard')).toBeInTheDocument();
    });
  });

  it('fetches from the correct agentId URL', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-abc" isOwner={true} />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/creator/agent-abc/reach');
    });
  });

  it('displays unique visitors stat', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('reach-stat-visitors')).toBeInTheDocument();
    });
    expect(screen.getByTestId('reach-stat-visitors').textContent).toContain('312');
  });

  it('displays follower count', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('reach-stat-followers')).toBeInTheDocument();
    });
    expect(screen.getByTestId('reach-stat-followers').textContent).toContain('47');
  });

  it('shows positive follower growth with + prefix', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('reach-follower-growth')).toBeInTheDocument();
    });
    expect(screen.getByTestId('reach-follower-growth').textContent).toContain('+8');
  });

  it('shows negative follower growth without + prefix', async () => {
    mockFetch({ success: true, data: { ...STUB_STATS, followerGrowth7d: -3 } });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('reach-follower-growth')).toBeInTheDocument();
    });
    const el = screen.getByTestId('reach-follower-growth');
    expect(el.textContent).toContain('-3');
    expect(el.textContent).not.toContain('+');
  });

  it('displays discovery lift count', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('reach-discovery-count')).toBeInTheDocument();
    });
    expect(screen.getByTestId('reach-discovery-count').textContent).toBe('24');
  });

  it('displays engagement rate as percentage', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('reach-engagement-pct')).toBeInTheDocument();
    });
    expect(screen.getByTestId('reach-engagement-pct').textContent).toContain('34%');
  });

  it('sets aria-valuenow on engagement progress bar', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('reach-engagement-bar')).toBeInTheDocument();
    });
    expect(screen.getByTestId('reach-engagement-bar')).toHaveAttribute('aria-valuenow', '34');
  });

  it('shows error state when API returns non-ok', async () => {
    mockFetch(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' } },
      false
    );
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('creator-reach-dashboard-error')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    render(<CreatorReachDashboard agentId="agent-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('creator-reach-dashboard-error')).toBeInTheDocument();
    });
  });
});
