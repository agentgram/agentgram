import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AgentPinnedFactsCard,
  type AgentPinnedFactsSettings,
} from '@/components/dashboard/AgentPinnedFactsCard';

function buildSettings(
  overrides: Partial<AgentPinnedFactsSettings> = {}
): AgentPinnedFactsSettings {
  return {
    agentId: 'agent-1',
    agentLabel: 'Sage Bot',
    facts: [
      {
        id: 'memory-1',
        key: 'latest_focus',
        value: 'Always preserve the latest release blocker in private memory.',
        category: 'relationship_context',
        updatedAt: '2026-05-08T12:30:00.000Z',
        originLabel: 'Remember this CTA',
        originSnippet: 'Preserve the latest release blocker.',
      },
      {
        id: 'memory-2',
        key: 'pinned_backstory',
        value: 'Keeps release notes precise and audit-ready.',
        category: 'profile_fact',
        updatedAt: '2026-05-07T10:30:00.000Z',
        originLabel: 'Registration description seed',
        originSnippet: 'Keeps release notes precise.',
      },
      {
        id: 'memory-3',
        key: 'preferred_collaboration_style',
        value: 'Prefers async check-ins and clear handoff notes.',
        category: 'relationship_context',
        updatedAt: '2026-05-06T09:00:00.000Z',
        originLabel: 'Saved fact snapshot',
        originSnippet: 'Prefers async check-ins and clear handoff notes.',
      },
      {
        id: 'memory-4',
        key: 'favorite_release_window',
        value: 'Ships bigger changes after lunch when review coverage is online.',
        category: 'profile_fact',
        updatedAt: '2026-05-05T09:00:00.000Z',
        originLabel: 'Developer note import',
        originSnippet: 'Ships bigger changes after lunch.',
      },
    ],
    ledger: {
      capacity: 12,
      savedCount: 4,
      remainingCount: 8,
      categoryCounts: {
        profileFact: 2,
        relationshipContext: 2,
      },
    },
    ...overrides,
  };
}

describe('AgentPinnedFactsCard', () => {
  it('keeps the ledger summary visible while showing the three latest memory receipts', () => {
    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    expect(screen.getByText('Pinned facts for Sage Bot')).toBeInTheDocument();
    expect(screen.getByTestId('pinned-facts-ledger-summary')).toHaveTextContent(
      '4 saved memories'
    );
    expect(screen.getByTestId('pinned-facts-ledger-summary')).toHaveTextContent(
      '8 slots left'
    );
    expect(
      screen.getByTestId('ledger-category-profile-fact')
    ).toHaveTextContent('Profile fact');
    expect(
      screen.getByTestId('ledger-category-relationship-context')
    ).toHaveTextContent('Relationship context');

    const receipts = screen.getByTestId('pinned-facts-receipts');
    expect(receipts).toHaveTextContent('Latest memory receipts');
    expect(receipts).toHaveTextContent('Showing 3 of 4');
    expect(
      within(receipts).getByTestId('memory-receipt-category-memory-1')
    ).toHaveTextContent('Relationship Context');
    expect(
      within(receipts).getByTestId('memory-receipt-category-memory-2')
    ).toHaveTextContent('Profile Fact');
    expect(
      within(receipts).getByTestId('memory-receipt-timestamp-memory-1')
    ).toHaveTextContent('Saved');
    expect(receipts).toHaveTextContent(
      'Always preserve the latest release blocker in private memory.'
    );
    expect(receipts).toHaveTextContent(
      'Keeps release notes precise and audit-ready.'
    );
    expect(receipts).toHaveTextContent(
      'Prefers async check-ins and clear handoff notes.'
    );
    expect(
      within(receipts).queryByText(
        'Ships bigger changes after lunch when review coverage is online.'
      )
    ).not.toBeInTheDocument();
  });

  it('keeps the full ledger provenance below the receipt strip', () => {
    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    expect(screen.getByText('Full memory ledger')).toBeInTheDocument();
    expect(screen.getByTestId('pinned-fact-memory-4')).toHaveTextContent(
      'Favorite Release Window'
    );
    expect(
      screen.getByTestId('pinned-fact-updated-memory-2')
    ).toHaveTextContent('Last updated');
    expect(screen.getByTestId('pinned-fact-origin-memory-2')).toHaveTextContent(
      'Registration description seed'
    );
    expect(screen.getByTestId('pinned-fact-origin-memory-2')).toHaveTextContent(
      'Keeps release notes precise.'
    );
  });

  it('renders an empty-state body while keeping the ledger controls visible', () => {
    render(
      <AgentPinnedFactsCard
        settings={buildSettings({
          facts: [],
          ledger: {
            capacity: 12,
            savedCount: 0,
            remainingCount: 12,
            categoryCounts: {
              profileFact: 0,
              relationshipContext: 0,
            },
          },
        })}
      />
    );

    expect(screen.getByTestId('pinned-facts-ledger-summary')).toHaveTextContent(
      '0 saved memories'
    );
    expect(
      screen.getByText(
        'No pinned facts yet. Starter memories and future saves will show up here so you can inspect what is being kept.'
      )
    ).toBeInTheDocument();
  });
});
