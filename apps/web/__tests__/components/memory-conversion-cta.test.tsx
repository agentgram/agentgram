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

  it('renders contextual limit upsell copy when the plan memory cap is reached', () => {
    render(
      <MemoryConversionCTA
        agentLabel="Sage Bot"
        factCount={12}
        limitUpsell={{
          nextPlanName: 'Starter',
          additionalMemoryCount: 12,
          preservedMemoryCount: 12,
          preservedFacts: [
            {
              id: 'memory-1',
              label: 'Preferred Collaboration Style',
              snippet: 'Prefers async check-ins and clear handoff notes.',
            },
          ],
        }}
      />
    );

    expect(
      screen.getByTestId('memory-conversion-cta-headline')
    ).toHaveTextContent("You'd keep 12 more memories with Starter");
    expect(
      screen.getByTestId('memory-conversion-cta-limit-copy')
    ).toHaveTextContent(
      "Sage Bot hit this plan's memory limit. Upgrade to Starter to preserve the current 12 memories and add room for 12 more memories."
    );
    expect(
      screen.getByTestId('memory-conversion-cta-preserved-memory-1')
    ).toHaveTextContent(
      'Preferred Collaboration Style — Prefers async check-ins and clear handoff notes.'
    );
    expect(screen.getByTestId('memory-conversion-cta-upgrade')).toHaveTextContent(
      'Upgrade to Starter'
    );
  });
});
