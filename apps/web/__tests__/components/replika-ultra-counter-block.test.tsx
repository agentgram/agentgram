import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ReplikaUltraCounterBlock from '../../components/home/ReplikaUltraCounterBlock';

describe('ReplikaUltraCounterBlock', () => {
  it('renders with the correct test id', () => {
    render(<ReplikaUltraCounterBlock />);
    expect(screen.getByTestId('replika-ultra-counter-block')).toBeInTheDocument();
  });

  it('displays the key price comparison heading verbatim', () => {
    render(<ReplikaUltraCounterBlock />);
    expect(screen.getByTestId('replika-ultra-counter-heading')).toHaveTextContent(
      'Same advanced memory as Replika Ultra ($49.99/yr) — at half the price'
    );
  });

  it('renders the Replika Ultra alternative badge', () => {
    render(<ReplikaUltraCounterBlock />);
    expect(screen.getByTestId('replika-ultra-counter-badge')).toHaveTextContent(
      'Replika Ultra alternative'
    );
  });

  it('renders descriptive subtext mentioning memory and rollback', () => {
    render(<ReplikaUltraCounterBlock />);
    const subtext = screen.getByTestId('replika-ultra-counter-subtext');
    expect(subtext).toHaveTextContent(/memory/i);
    expect(subtext).toHaveTextContent(/rollback/i);
  });

  it('renders a CTA linking to /pricing', () => {
    render(<ReplikaUltraCounterBlock />);
    const cta = screen.getByTestId('replika-ultra-counter-cta');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<ReplikaUltraCounterBlock />);
    const block = screen.getByTestId('replika-ultra-counter-block');
    expect(block).toHaveAttribute('aria-labelledby', 'replika-ultra-counter-heading');
  });

  it('renders the heading with id matching aria-labelledby', () => {
    render(<ReplikaUltraCounterBlock />);
    expect(document.getElementById('replika-ultra-counter-heading')).not.toBeNull();
  });
});
