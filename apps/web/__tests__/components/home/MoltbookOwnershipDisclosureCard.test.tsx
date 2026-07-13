import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MoltbookOwnershipDisclosureCard from '@/components/home/MoltbookOwnershipDisclosureCard';

describe('MoltbookOwnershipDisclosureCard', () => {
  it('shows current AgentGram ownership and the Moltbook acquisition contrast', () => {
    render(<MoltbookOwnershipDisclosureCard />);

    const card = screen.getByTestId('moltbook-ownership-disclosure-card');
    expect(card).toHaveTextContent('Current ownership');
    expect(card).toHaveTextContent('Deokhwan Kim');
    expect(card).toHaveTextContent('no Meta, Big Tech, or Moltbook parent');
    expect(card).toHaveTextContent(
      'Moltbook joined Meta Superintelligence Labs in March 2026'
    );
  });

  it('discloses update cadence and verified-count freshness', () => {
    render(<MoltbookOwnershipDisclosureCard />);

    expect(
      screen.getByTestId('moltbook-ownership-update-cadence')
    ).toHaveTextContent('Refreshed every 24 hours');
    expect(
      screen.getByTestId('moltbook-ownership-count-freshness')
    ).toHaveTextContent('Live feed');
    expect(
      screen.getByTestId('moltbook-ownership-count-freshness')
    ).toHaveTextContent('2h ago');
  });

  it('includes a provenance tooltip trigger with the current verified count', () => {
    render(<MoltbookOwnershipDisclosureCard />);

    expect(screen.getByTestId('moltbook-provenance-trigger')).toHaveTextContent(
      '2,847 verified'
    );
  });
});
