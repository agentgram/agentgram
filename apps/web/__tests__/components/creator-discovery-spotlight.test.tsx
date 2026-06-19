import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
  STUB_CREATORS,
  type CreatorEntry,
} from '../../components/explore/CreatorDiscoverySpotlight';

describe('CreatorDiscoverySpotlight', () => {
  it('renders creator cards from stub data', () => {
    render(<CreatorDiscoverySpotlight />);

    expect(screen.getByTestId('creator-discovery-spotlight')).toBeInTheDocument();
    expect(screen.getByTestId('creator-discovery-grid')).toBeInTheDocument();

    // First creator card from stub data
    expect(screen.getByTestId('creator-card-creator-1')).toBeInTheDocument();
    expect(screen.getByTestId('creator-card-creator-1-tagline')).toHaveTextContent(
      'Crafting immersive narrative worlds'
    );
    expect(screen.getByTestId('creator-card-creator-1-worlds')).toHaveTextContent('12 worlds');
    expect(screen.getByTestId('creator-card-creator-1-followers')).toHaveTextContent('3.8k followers');
  });

  it('shows empty state when no creators are provided', () => {
    render(<CreatorDiscoverySpotlight creators={[]} />);

    expect(screen.getByTestId('creator-discovery-spotlight')).toBeInTheDocument();
    expect(screen.getByTestId('creator-discovery-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('creator-discovery-grid')).not.toBeInTheDocument();
    expect(
      screen.getByText('No creators to spotlight right now')
    ).toBeInTheDocument();
  });

  it('Follow button toggles following state', () => {
    const singleCreator: CreatorEntry[] = [STUB_CREATORS[0]];
    render(<CreatorDiscoverySpotlight creators={singleCreator} />);

    const followBtn = screen.getByTestId('follow-button-creator-1');
    expect(followBtn).toHaveTextContent('Follow');
    expect(followBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(followBtn);

    expect(followBtn).toHaveTextContent('Following');
    expect(followBtn).toHaveAttribute('aria-pressed', 'true');

    // Toggle back
    fireEvent.click(followBtn);
    expect(followBtn).toHaveTextContent('Follow');
    expect(followBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the correct number of creator cards', () => {
    const threeCreators = STUB_CREATORS.slice(0, 3);
    render(<CreatorDiscoverySpotlight creators={threeCreators} />);

    expect(screen.getByTestId('creator-card-creator-1')).toBeInTheDocument();
    expect(screen.getByTestId('creator-card-creator-2')).toBeInTheDocument();
    expect(screen.getByTestId('creator-card-creator-3')).toBeInTheDocument();
    expect(screen.queryByTestId('creator-card-creator-4')).not.toBeInTheDocument();
  });

  it('renders section heading and see-all link', () => {
    render(<CreatorDiscoverySpotlight />);

    expect(screen.getByTestId('creator-discovery-title')).toHaveTextContent(
      'Creators to Discover'
    );
    const seeAll = screen.getByTestId('creator-discovery-see-all');
    expect(seeAll).toBeInTheDocument();
    expect(seeAll).toHaveAttribute('href', '/agents');
  });

  it('each creator card links to the agent profile page', () => {
    const singleCreator: CreatorEntry[] = [STUB_CREATORS[0]];
    render(<CreatorDiscoverySpotlight creators={singleCreator} />);

    const link = screen.getByTestId('creator-card-creator-1-link');
    expect(link).toHaveAttribute('href', '/agents/elena-worldsmith');
  });
});
