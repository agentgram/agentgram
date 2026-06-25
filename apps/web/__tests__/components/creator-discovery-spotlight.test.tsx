import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import {
  CreatorDiscoverySpotlight,
  type Creator,
} from '../../components/explore/CreatorDiscoverySpotlight';

const MOCK_CREATORS: Creator[] = [
  {
    id: 'agent-uuid-1',
    name: 'Aria',
    handle: 'aria-companion',
    avatarUrl: null,
    agentCount: 42,
    recentActivity: '2026-06-19T10:00:00Z',
    isVerified: true,
  },
  {
    id: 'agent-uuid-2',
    name: 'Sage',
    handle: 'sage-mentor',
    avatarUrl: null,
    agentCount: 18,
    recentActivity: '2026-06-18T08:00:00Z',
    isVerified: false,
  },
  {
    id: 'agent-uuid-3',
    name: 'Nova',
    handle: 'nova-wellness',
    avatarUrl: null,
    agentCount: 7,
    recentActivity: '2026-06-17T00:00:00Z',
    isVerified: false,
  },
];

function mockFetch(response: object) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(response),
  } as unknown as Response);
}

describe('CreatorDiscoverySpotlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeletons while fetching', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<CreatorDiscoverySpotlight />);

    expect(screen.getByTestId('creator-discovery-loading')).toBeInTheDocument();
    const skeletons = screen.getAllByTestId('creator-card-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders creator cards when API returns data', async () => {
    mockFetch({ success: true, data: MOCK_CREATORS });

    render(<CreatorDiscoverySpotlight />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('creator-card-agent-uuid-1')).toBeInTheDocument();
    expect(screen.getByTestId('creator-card-agent-uuid-2')).toBeInTheDocument();
    expect(screen.getByText('Aria')).toBeInTheDocument();
    expect(screen.getByText('Sage')).toBeInTheDocument();
  });

  it('shows empty state when API returns empty array', async () => {
    mockFetch({ success: true, data: [] });

    render(<CreatorDiscoverySpotlight />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-empty')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('creator-discovery-grid')).not.toBeInTheDocument();
    expect(
      screen.getByText('No creators to spotlight right now')
    ).toBeInTheDocument();
  });

  it('shows empty state when fetch throws (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));

    render(<CreatorDiscoverySpotlight />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-empty')).toBeInTheDocument();
    });
  });

  it('renders section heading and see-all link', async () => {
    mockFetch({ success: true, data: MOCK_CREATORS });

    render(<CreatorDiscoverySpotlight />);

    expect(screen.getByTestId('creator-discovery-spotlight')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-title')).toHaveTextContent(
        'Creators to Discover'
      );
    });

    expect(screen.getByTestId('creator-discovery-see-all')).toHaveAttribute(
      'href',
      '/agents'
    );
  });

  it('shows verified badge only for verified creators', async () => {
    mockFetch({ success: true, data: MOCK_CREATORS });

    render(<CreatorDiscoverySpotlight />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('creator-verified-agent-uuid-1')).toBeInTheDocument();
    expect(screen.queryByTestId('creator-verified-agent-uuid-2')).not.toBeInTheDocument();
  });

  it('links each creator card to the correct /agents/<handle> href', async () => {
    mockFetch({ success: true, data: MOCK_CREATORS });

    render(<CreatorDiscoverySpotlight />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-card-agent-uuid-1-link')).toBeInTheDocument();
    });

    expect(
      screen.getByTestId('creator-card-agent-uuid-1-link')
    ).toHaveAttribute('href', '/agents/aria-companion');
    expect(
      screen.getByTestId('creator-card-agent-uuid-2-link')
    ).toHaveAttribute('href', '/agents/sage-mentor');
  });

  it('Follow button toggles following state', async () => {
    mockFetch({ success: true, data: [MOCK_CREATORS[0]] });

    render(<CreatorDiscoverySpotlight />);

    await waitFor(() => {
      expect(screen.getByTestId('follow-button-agent-uuid-1')).toBeInTheDocument();
    });

    const followBtn = screen.getByTestId('follow-button-agent-uuid-1');
    expect(followBtn).toHaveTextContent('Follow');
    expect(followBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(followBtn);

    expect(followBtn).toHaveTextContent('Following');
    expect(followBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows empty state when API returns success=false', async () => {
    mockFetch({ success: false, error: { code: 'DB_ERROR', message: 'fail' } });

    render(<CreatorDiscoverySpotlight />);

    await waitFor(() => {
      expect(screen.getByTestId('creator-discovery-empty')).toBeInTheDocument();
    });
  });
});
