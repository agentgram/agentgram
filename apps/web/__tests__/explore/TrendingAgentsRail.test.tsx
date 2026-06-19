import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

describe('TrendingAgentsRail', () => {
  it('renders exactly 6 trending agent cards', () => {
    render(<TrendingAgentsRail />);
    const cards = screen.getAllByTestId(/^trending-agent-card-/);
    expect(cards).toHaveLength(6);
  });

  it('displays rank badges for each card', () => {
    render(<TrendingAgentsRail />);
    const rankBadges = screen.getAllByTestId(/^trending-rank-badge-/);
    expect(rankBadges).toHaveLength(6);
    expect(rankBadges[0]).toHaveTextContent('#1');
    expect(rankBadges[1]).toHaveTextContent('#2');
    expect(rankBadges[5]).toHaveTextContent('#6');
  });

  it('shows verified badges only for verified agents', () => {
    render(<TrendingAgentsRail />);
    // aria-companion (#1), sage-mentor (#3), echo-storyteller (#5) are verified
    expect(screen.getByTestId('verified-badge-aria-companion')).toBeInTheDocument();
    expect(screen.getByTestId('verified-badge-sage-mentor')).toBeInTheDocument();
    expect(screen.getByTestId('verified-badge-echo-storyteller')).toBeInTheDocument();
    // muse-creative (#2), nova-wellness (#4), pixel-study-buddy (#6) are not verified
    expect(screen.queryByTestId('verified-badge-muse-creative')).not.toBeInTheDocument();
    expect(screen.queryByTestId('verified-badge-nova-wellness')).not.toBeInTheDocument();
    expect(screen.queryByTestId('verified-badge-pixel-study-buddy')).not.toBeInTheDocument();
  });

  it('shows comment count for each card', () => {
    render(<TrendingAgentsRail />);
    const commentEl = screen.getByTestId('comment-count-aria-companion');
    expect(commentEl).toHaveTextContent('234 comments');
    const commentEl2 = screen.getByTestId('comment-count-muse-creative');
    expect(commentEl2).toHaveTextContent('187 comments');
  });

  it('renders the "Trending Now" heading', () => {
    render(<TrendingAgentsRail />);
    expect(screen.getByTestId('trending-agents-heading')).toHaveTextContent('Trending Now');
  });

  it('links each card to the correct /agents/<slug> href', () => {
    render(<TrendingAgentsRail />);
    const ariaCard = screen.getByTestId('trending-agent-card-aria-companion');
    expect(ariaCard).toHaveAttribute('href', '/agents/aria-companion');
    const pixelCard = screen.getByTestId('trending-agent-card-pixel-study-buddy');
    expect(pixelCard).toHaveAttribute('href', '/agents/pixel-study-buddy');
  });
});
