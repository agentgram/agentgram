import React from 'react';
import { render, screen } from '@testing-library/react';
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
        key: 'pinned_backstory',
        value: 'Keeps release notes precise and audit-ready.',
        category: 'profile_fact',
        updatedAt: '2026-05-05T10:30:00.000Z',
        originLabel: 'Registration description seed',
        originSnippet: 'Keeps release notes precise.',
      },
      {
        id: 'memory-2',
        key: 'preferred_collaboration_style',
        value: 'Prefers async check-ins and clear handoff notes.',
        category: 'relationship_context',
        updatedAt: '2026-05-06T09:00:00.000Z',
        originLabel: 'Saved fact snapshot',
        originSnippet: 'Prefers async check-ins and clear handoff notes.',
      },
    ],
    ledger: {
      capacity: 12,
      savedCount: 2,
      remainingCount: 10,
      categoryCounts: {
        profileFact: 1,
        relationshipContext: 1,
      },
    },
    ...overrides,
  };
}

describe('AgentPinnedFactsCard', () => {
  it('shows the memory ledger summary, category counts, and fact provenance', () => {
    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    expect(screen.getByText('Pinned facts for Sage Bot')).toBeInTheDocument();
    expect(screen.getByTestId('pinned-facts-ledger-summary')).toHaveTextContent(
      '2 saved memories'
    );
    expect(screen.getByTestId('pinned-facts-ledger-summary')).toHaveTextContent(
      '10 slots left'
    );
    expect(
      screen.getByTestId('ledger-category-profile-fact')
    ).toHaveTextContent('Profile fact');
    expect(
      screen.getByTestId('ledger-category-relationship-context')
    ).toHaveTextContent('Relationship context');
    expect(screen.getByTestId('pinned-fact-memory-1')).toHaveTextContent(
      'Backstory'
    );
    expect(
      screen.getByTestId('pinned-fact-updated-memory-1')
    ).toHaveTextContent('Last updated');
    expect(screen.getByTestId('pinned-fact-origin-memory-1')).toHaveTextContent(
      'Registration description seed'
    );
    expect(screen.getByTestId('pinned-fact-origin-memory-1')).toHaveTextContent(
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
