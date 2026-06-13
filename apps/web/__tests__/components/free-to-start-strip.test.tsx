import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FreeToStartStrip, {
  FreeToStartBadge,
} from '../../components/home/FreeToStartStrip';

describe('FreeToStartStrip', () => {
  it('renders with correct test id', () => {
    render(<FreeToStartStrip />);
    expect(
      screen.getByTestId('home-free-to-start-strip')
    ).toBeInTheDocument();
  });

  it('displays try free headline', () => {
    render(<FreeToStartStrip />);
    expect(
      screen.getByText(/Try free · No credit card required/i)
    ).toBeInTheDocument();
  });

  it('mentions Replika forced subscription context', () => {
    render(<FreeToStartStrip />);
    expect(
      screen.getByText(/Replika requires a paid subscription/i)
    ).toBeInTheDocument();
  });

  it('mentions no forced subscription differentiator', () => {
    render(<FreeToStartStrip />);
    expect(
      screen.getByText(/no forced subscription/i)
    ).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<FreeToStartStrip />);
    expect(
      screen.getByLabelText('Try free, no credit card required')
    ).toBeInTheDocument();
  });
});

describe('FreeToStartBadge', () => {
  it('renders with correct test id', () => {
    render(<FreeToStartBadge />);
    expect(
      screen.getByTestId('free-to-start-badge')
    ).toBeInTheDocument();
  });

  it('displays try free label', () => {
    render(<FreeToStartBadge />);
    expect(
      screen.getByText(/Try free · No credit card required/i)
    ).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<FreeToStartBadge />);
    expect(
      screen.getByLabelText('Free to start, no credit card required')
    ).toBeInTheDocument();
  });
});
