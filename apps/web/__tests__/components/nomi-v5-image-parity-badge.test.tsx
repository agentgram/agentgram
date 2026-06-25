import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NomiV5ImageParityBadge } from '../../components/agents/NomiV5ImageParityBadge';

describe('NomiV5ImageParityBadge', () => {
  it('renders with the correct data-testid', () => {
    render(<NomiV5ImageParityBadge />);
    expect(
      screen.getByTestId('nomi-v5-image-parity-badge')
    ).toBeInTheDocument();
  });

  it('displays the image parity label text', () => {
    render(<NomiV5ImageParityBadge />);
    expect(
      screen.getByTestId('nomi-v5-image-parity-badge')
    ).toHaveTextContent('V5-class image generation — free');
  });

  it('has a descriptive title attribute referencing free tiers', () => {
    render(<NomiV5ImageParityBadge />);
    const badge = screen.getByTestId('nomi-v5-image-parity-badge');
    expect(badge).toHaveAttribute(
      'title',
      expect.stringContaining('free on all tiers')
    );
  });

  it('has a title attribute referencing V5-class quality', () => {
    render(<NomiV5ImageParityBadge />);
    const badge = screen.getByTestId('nomi-v5-image-parity-badge');
    expect(badge).toHaveAttribute('title', expect.stringContaining('V5-class'));
  });

  it('accepts an optional className prop', () => {
    render(<NomiV5ImageParityBadge className="my-custom-class" />);
    expect(screen.getByTestId('nomi-v5-image-parity-badge')).toHaveClass(
      'my-custom-class'
    );
  });
});
