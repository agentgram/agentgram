import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryConversionCTA } from '@/components/memory-conversion-cta';

describe('MemoryConversionCTA', () => {
  it('renders the CTA container', () => {
    render(<MemoryConversionCTA factCount={4} />);
    expect(screen.getByTestId('memory-conversion-cta')).toBeInTheDocument();
  });

  it('shows generic headline with fact count when no agentLabel', () => {
    render(<MemoryConversionCTA factCount={4} />);
    expect(
      screen.getByTestId('memory-conversion-cta-headline')
    ).toHaveTextContent('Your AI remembers 4 facts about you');
  });

  it('uses agent label in headline when provided', () => {
    render(<MemoryConversionCTA factCount={7} agentLabel="Sage Bot" />);
    expect(
      screen.getByTestId('memory-conversion-cta-headline')
    ).toHaveTextContent('Sage Bot remembers 7 facts about you');
  });

  it('handles singular fact count correctly', () => {
    render(<MemoryConversionCTA factCount={1} />);
    expect(
      screen.getByTestId('memory-conversion-cta-headline')
    ).toHaveTextContent('Your AI remembers 1 fact about you');
  });

  it('renders the upgrade CTA linking to /pricing', () => {
    render(<MemoryConversionCTA factCount={4} />);
    const upgrade = screen.getByTestId('memory-conversion-cta-upgrade');
    expect(upgrade).toBeInTheDocument();
    expect(upgrade).toHaveAttribute('href', '/pricing');
  });

  it('renders the view-all link pointing to settings memory anchor', () => {
    render(<MemoryConversionCTA factCount={4} />);
    const viewAll = screen.getByTestId('memory-conversion-cta-view-all');
    expect(viewAll).toBeInTheDocument();
    expect(viewAll).toHaveAttribute('href', '/dashboard/settings#memory');
  });

  it('renders premium memory description copy', () => {
    render(<MemoryConversionCTA factCount={4} />);
    expect(
      screen.getByText(
        /unlimited facts, categories, and export/i
      )
    ).toBeInTheDocument();
  });
});
