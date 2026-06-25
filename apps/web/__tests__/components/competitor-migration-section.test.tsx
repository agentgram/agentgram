import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CompetitorMigrationSection from '../../components/home/CompetitorMigrationSection';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}));

describe('CompetitorMigrationSection', () => {
  it('renders without crash', () => {
    render(<CompetitorMigrationSection />);
    expect(
      screen.getByRole('region', { name: /switching from replika or kindroid/i })
    ).toBeInTheDocument();
  });

  it('renders the C.AI quality counter block', () => {
    render(<CompetitorMigrationSection />);
    expect(screen.getByTestId('cai-quality-counter-block')).toBeInTheDocument();
  });

  it('shows quality-first badge text', () => {
    render(<CompetitorMigrationSection />);
    expect(screen.getByTestId('cai-quality-counter-badge')).toHaveTextContent(
      'Quality-first, no silent regressions'
    );
  });

  it('shows no hidden quality cuts headline', () => {
    render(<CompetitorMigrationSection />);
    expect(screen.getByTestId('cai-quality-counter-heading')).toHaveTextContent(
      'Unlike C.AI — no hidden quality cuts, no silent regression updates'
    );
  });

  it('shows C.AI silent cost-cut context in body copy', () => {
    render(<CompetitorMigrationSection />);
    const body = screen.getByTestId('cai-quality-counter-body');
    expect(body).toHaveTextContent('Character.AI masked cost-reduction changes');
    expect(body).toHaveTextContent('RoboRhythms analysis');
    expect(body).toHaveTextContent('zero silent quality degradations');
  });

  it('includes no silent quality cuts in the checklist', () => {
    render(<CompetitorMigrationSection />);
    expect(
      screen.getByText(/No silent quality cuts — memory, personas & responses stay consistent/i)
    ).toBeInTheDocument();
  });
});
