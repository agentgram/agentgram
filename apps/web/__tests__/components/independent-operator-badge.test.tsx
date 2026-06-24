import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IndependentOperatorBadge from '../../components/home/IndependentOperatorBadge';

describe('IndependentOperatorBadge', () => {
  it('renders with correct test id', () => {
    render(<IndependentOperatorBadge />);
    expect(screen.getByTestId('independent-operator-badge')).toBeInTheDocument();
  });

  it('displays the not Meta/Big Tech headline', () => {
    render(<IndependentOperatorBadge />);
    expect(
      screen.getByTestId('independent-operator-badge-headline')
    ).toHaveTextContent('Independently owned & operated — not Meta/Big Tech.');
  });

  it('mentions Moltbook joining Meta in the subtext', () => {
    render(<IndependentOperatorBadge />);
    expect(
      screen.getByTestId('independent-operator-badge-subtext')
    ).toHaveTextContent(/Moltbook joined Meta Superintelligence Labs/i);
  });

  it('subtext affirms staying independent, open-source, and community-driven', () => {
    render(<IndependentOperatorBadge />);
    expect(
      screen.getByTestId('independent-operator-badge-subtext')
    ).toHaveTextContent(/independent, open-source, and community-driven/i);
  });

  it('has descriptive aria-label for accessibility', () => {
    render(<IndependentOperatorBadge />);
    expect(
      screen.getByLabelText(
        'Independently owned and operated — not Meta or Big Tech'
      )
    ).toBeInTheDocument();
  });
});
