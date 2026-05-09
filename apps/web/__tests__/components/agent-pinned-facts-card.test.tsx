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
    ],
    ...overrides,
  };
}

describe('AgentPinnedFactsCard', () => {
  it('shows last-updated metadata and origin snippets for each pinned fact', () => {
    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    expect(screen.getByText('Pinned facts for Sage Bot')).toBeInTheDocument();
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

  it('renders an empty state when no pinned facts exist yet', () => {
    render(
      <AgentPinnedFactsCard
        settings={buildSettings({
          facts: [],
        })}
      />
    );

    expect(
      screen.getByText(
        'No pinned facts yet. Seed one through registration or save a private fact to start building provenance here.'
      )
    ).toBeInTheDocument();
  });
});
