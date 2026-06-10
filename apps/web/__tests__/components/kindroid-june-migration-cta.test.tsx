import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import KindroidJuneMigrationCTA from '../../components/home/KindroidJuneMigrationCTA';

describe('KindroidJuneMigrationCTA', () => {
  it('renders the section with correct test id', () => {
    render(<KindroidJuneMigrationCTA />);
    expect(screen.getByTestId('kindroid-migration-cta')).toBeInTheDocument();
  });

  it('displays the main heading mentioning Kindroid', () => {
    render(<KindroidJuneMigrationCTA />);
    expect(screen.getByTestId('kindroid-migration-heading')).toHaveTextContent(
      /Kindroid/i
    );
  });

  it('displays the badge label referencing the June 2026 price change', () => {
    render(<KindroidJuneMigrationCTA />);
    expect(screen.getByTestId('kindroid-migration-badge-label')).toHaveTextContent(
      /June 2026/i
    );
  });

  it('displays the subtext describing the pricing change context', () => {
    render(<KindroidJuneMigrationCTA />);
    expect(screen.getByTestId('kindroid-migration-subtext')).toHaveTextContent(
      /June 2026/i
    );
  });

  it('renders the differentiators list with at least 3 items', () => {
    render(<KindroidJuneMigrationCTA />);
    const list = screen.getByTestId('kindroid-migration-differentiators');
    const items = list.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<KindroidJuneMigrationCTA />);
    const cta = screen.getByTestId('kindroid-migration-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<KindroidJuneMigrationCTA />);
    const cta = screen.getByTestId('kindroid-migration-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<KindroidJuneMigrationCTA />);
    const section = screen.getByTestId('kindroid-migration-cta');
    expect(section).toHaveAttribute('aria-labelledby', 'kindroid-migration-heading');
  });
});
