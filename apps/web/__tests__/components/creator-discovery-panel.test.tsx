import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatorDiscoveryPanel } from '@/components/creator/CreatorDiscoveryPanel';
import { CreatorDiscoveryPrompts } from '@/components/creator/CreatorDiscoveryPrompts';

function mockFetch(response: object, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
  } as unknown as Response);
}

const STUB_STATS = {
  totalConversations: 142,
  uniqueUsersReached: 89,
  followerCount: 23,
  weeklyTrend: 12,
};

describe('CreatorDiscoveryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOwner is false (auth gate)', () => {
    mockFetch({ success: true, data: STUB_STATS });
    const { container } = render(<CreatorDiscoveryPanel isOwner={false} />);
    expect(container.firstChild).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows loading skeleton while fetching when isOwner is true', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CreatorDiscoveryPanel isOwner={true} />);
    expect(screen.getByTestId('creator-discovery-panel-loading')).toBeInTheDocument();
  });

  it('renders stats panel after successful fetch', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-panel')).toBeInTheDocument();
    });
  });

  it('displays total conversations stat', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('discovery-stat-conversations')).toBeInTheDocument();
    });
    expect(screen.getByTestId('discovery-stat-conversations').textContent).toContain('142');
  });

  it('displays unique users reached stat', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('discovery-stat-users-reached')).toBeInTheDocument();
    });
    expect(screen.getByTestId('discovery-stat-users-reached').textContent).toContain('89');
  });

  it('displays follower count stat', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('discovery-stat-followers')).toBeInTheDocument();
    });
    expect(screen.getByTestId('discovery-stat-followers').textContent).toContain('23');
  });

  it('shows positive weekly trend with + prefix', async () => {
    mockFetch({ success: true, data: STUB_STATS });
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('discovery-trend-value')).toBeInTheDocument();
    });
    expect(screen.getByTestId('discovery-trend-value').textContent).toContain('+12');
  });

  it('shows negative weekly trend without + prefix', async () => {
    mockFetch({ success: true, data: { ...STUB_STATS, weeklyTrend: -5 } });
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('discovery-trend-value')).toBeInTheDocument();
    });
    const trendEl = screen.getByTestId('discovery-trend-value');
    expect(trendEl.textContent).toContain('-5');
    expect(trendEl.textContent).not.toContain('+');
  });

  it('shows error state when API returns non-ok', async () => {
    mockFetch(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' } },
      false
    );
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-panel-error')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    render(<CreatorDiscoveryPanel isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-panel-error')).toBeInTheDocument();
    });
  });
});

describe('CreatorDiscoveryPrompts', () => {
  it('renders the get-discovered panel', () => {
    render(<CreatorDiscoveryPrompts completionPercent={60} />);
    expect(screen.getByTestId('creator-discovery-prompts')).toBeInTheDocument();
  });

  it('renders completion progress bar', () => {
    render(<CreatorDiscoveryPrompts completionPercent={60} />);
    expect(screen.getByTestId('completion-progress-bar')).toBeInTheDocument();
  });

  it('sets correct aria-valuenow on progress bar', () => {
    render(<CreatorDiscoveryPrompts completionPercent={75} />);
    const bar = screen.getByTestId('completion-progress-bar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps completion percent to 100', () => {
    render(<CreatorDiscoveryPrompts completionPercent={150} />);
    const bar = screen.getByTestId('completion-progress-bar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps completion percent to 0 for negative values', () => {
    render(<CreatorDiscoveryPrompts completionPercent={-10} />);
    const bar = screen.getByTestId('completion-progress-bar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders suggested tags', () => {
    render(<CreatorDiscoveryPrompts completionPercent={40} />);
    expect(screen.getByTestId('suggested-tags')).toBeInTheDocument();
    expect(screen.getByTestId('suggested-tag-companion')).toBeInTheDocument();
    expect(screen.getByTestId('suggested-tag-roleplay')).toBeInTheDocument();
  });

  it('renders discovery tips list', () => {
    render(<CreatorDiscoveryPrompts completionPercent={40} />);
    expect(screen.getByTestId('discovery-tips-list')).toBeInTheDocument();
  });

  it('dismisses a tip when dismiss button clicked', () => {
    render(<CreatorDiscoveryPrompts completionPercent={40} />);
    const dismissBtn = screen.getByTestId('dismiss-tip-add-tags');
    fireEvent.click(dismissBtn);
    expect(screen.queryByTestId('discovery-tip-add-tags')).not.toBeInTheDocument();
  });

  it('calls onDismiss callback with correct tip id', () => {
    const onDismiss = vi.fn();
    render(<CreatorDiscoveryPrompts completionPercent={40} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('dismiss-tip-add-tags'));
    expect(onDismiss).toHaveBeenCalledWith('add-tags');
  });

  it('shows completion percent label', () => {
    render(<CreatorDiscoveryPrompts completionPercent={55} />);
    expect(screen.getByTestId('completion-percent-label').textContent).toContain('55%');
  });
});
