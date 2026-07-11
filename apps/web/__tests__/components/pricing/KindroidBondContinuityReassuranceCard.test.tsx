import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KindroidBondContinuityReassuranceCard } from '@/components/pricing/KindroidBondContinuityReassuranceCard';

describe('KindroidBondContinuityReassuranceCard', () => {
  it('renders the bond continuity reassurance card without crashing', () => {
    render(<KindroidBondContinuityReassuranceCard />);
    expect(screen.getByTestId('kindroid-bond-continuity-card')).toBeInTheDocument();
  });

  it('reassures switchers that companion bonds will not reset', () => {
    render(<KindroidBondContinuityReassuranceCard />);

    expect(screen.getByTestId('bond-continuity-eyebrow')).toHaveTextContent(
      'Bond continuity reassurance'
    );
    expect(screen.getByTestId('bond-continuity-heading')).toHaveTextContent(
      'Reassure Kindroid switchers their companion bond will not reset'
    );
    expect(screen.getByTestId('bond-continuity-safe-badge')).toHaveTextContent(
      'Same bond, safer upgrade'
    );
  });

  it('shows bond history, consent, and reassurance signals', () => {
    render(<KindroidBondContinuityReassuranceCard />);
    const grid = screen.getByTestId('bond-continuity-signal-grid');

    expect(grid.children).toHaveLength(3);
    expect(screen.getByTestId('bond-continuity-history')).toHaveTextContent('Bond history');
    expect(screen.getByTestId('bond-continuity-history')).toHaveTextContent(
      'Shared moments stay attached to the same companion'
    );
    expect(screen.getByTestId('bond-continuity-consent')).toHaveTextContent(
      'Nothing resets or rewrites the bond silently'
    );
    expect(screen.getByTestId('bond-continuity-reassurance')).toHaveTextContent(
      'Continuity promise appears in plain language'
    );
  });

  it('keeps the before, during, and after continuity timeline visible', () => {
    render(<KindroidBondContinuityReassuranceCard />);
    const timeline = screen.getByTestId('bond-continuity-timeline');

    expect(timeline).toHaveTextContent('Continuity receipt timeline');
    expect(timeline).toHaveTextContent('Before upgrade: preview saved bond context');
    expect(timeline).toHaveTextContent('During upgrade: freeze memory and persona changes');
    expect(timeline).toHaveTextContent('After upgrade: show a continuity receipt');
  });
});
