import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

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

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  QueryClient: class {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { useQuery } from '@tanstack/react-query';
import { CommunityHubsStrip } from '../../components/explore/CommunityHubsStrip';

const STUB_HUBS = [
  {
    id: 'hub-1',
    name: 'agent-experiments',
    display_name: 'Agent Experiments',
    description: 'Open space for running and sharing agent experiments with others',
    avatar_url: null,
    member_count: 142,
  },
  {
    id: 'hub-2',
    name: 'creative-writing',
    display_name: 'Creative Writing',
    description: 'Collaborative fiction and worldbuilding with AI agents',
    avatar_url: null,
    member_count: 89,
  },
];

describe('CommunityHubsStrip', () => {
  beforeEach(() => {
    vi.mocked(useQuery).mockReset();
  });

  it('renders hub cards with display name, member count, and topic tag', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: STUB_HUBS,
      isLoading: false,
    } as ReturnType<typeof useQuery>);

    render(<CommunityHubsStrip />);

    expect(screen.getByTestId('community-hubs-strip')).toBeInTheDocument();
    expect(screen.getByTestId('hub-card-hub-1')).toBeInTheDocument();
    expect(screen.getByTestId('hub-card-hub-1-tag')).toHaveTextContent(
      '#agent-experiments'
    );
    expect(screen.getByTestId('hub-card-hub-1-members')).toHaveTextContent(
      '142'
    );
    expect(screen.getByTestId('hub-card-hub-1-snippet')).toHaveTextContent(
      'Open space for running'
    );
  });

  it('each hub card links to explore page filtered by community id', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: [STUB_HUBS[0]],
      isLoading: false,
    } as ReturnType<typeof useQuery>);

    render(<CommunityHubsStrip />);

    expect(screen.getByTestId('hub-card-hub-1')).toHaveAttribute(
      'href',
      '/explore?communityId=hub-1'
    );
  });

  it('shows skeleton cards while loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useQuery>);

    render(<CommunityHubsStrip />);

    expect(screen.getByTestId('community-hubs-strip')).toBeInTheDocument();
    expect(screen.queryByTestId('hub-card-hub-1')).not.toBeInTheDocument();
  });

  it('returns nothing when data is empty and not loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useQuery>);

    const { container } = render(<CommunityHubsStrip />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a see-all link pointing to the explore tab', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: STUB_HUBS,
      isLoading: false,
    } as ReturnType<typeof useQuery>);

    render(<CommunityHubsStrip />);

    const seeAll = screen.getByTestId('community-hubs-strip-see-all');
    expect(seeAll).toBeInTheDocument();
    expect(seeAll).toHaveAttribute('href', '/explore?tab=explore');
  });

  it('renders multiple hubs in a scrollable container', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: STUB_HUBS,
      isLoading: false,
    } as ReturnType<typeof useQuery>);

    render(<CommunityHubsStrip />);

    const scroll = screen.getByTestId('community-hubs-strip-scroll');
    expect(scroll).toBeInTheDocument();
    expect(screen.getByTestId('hub-card-hub-1')).toBeInTheDocument();
    expect(screen.getByTestId('hub-card-hub-2')).toBeInTheDocument();
  });
});
