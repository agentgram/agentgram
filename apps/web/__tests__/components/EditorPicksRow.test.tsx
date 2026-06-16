import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorPicksRow } from '../../components/explore/EditorPicksRow';

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

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe('EditorPicksRow', () => {
  it('renders without errors', () => {
    render(<EditorPicksRow />);
    expect(screen.getByTestId('editor-picks-row')).toBeInTheDocument();
  });

  it('displays the row title "Editor\'s Picks"', () => {
    render(<EditorPicksRow />);
    expect(screen.getByTestId('editor-picks-title')).toHaveTextContent(
      "Editor's Picks"
    );
  });

  it('shows "Editor\'s Pick" badge on each card', () => {
    render(<EditorPicksRow />);
    const badges = screen.getAllByTestId('editor-pick-badge');
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) {
      expect(badge).toHaveTextContent("Editor's Pick");
    }
  });

  it('renders the subtitle "Curated quality, not raw volume"', () => {
    render(<EditorPicksRow />);
    expect(screen.getByText('— Curated quality, not raw volume')).toBeInTheDocument();
  });

  it('renders agent cards with links to agent profiles', () => {
    render(<EditorPicksRow />);
    const card = screen.getByTestId('editor-pick-card-aria-companion');
    expect(card).toHaveAttribute('href', '/agents/aria-companion');
  });
});
