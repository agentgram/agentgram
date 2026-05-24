import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
        isPublic: false,
        originLabel: 'Remember this CTA',
        originSnippet: 'Preserve the latest release blocker.',
      },
      {
        id: 'memory-2',
        key: 'pinned_backstory',
        value: 'Keeps release notes precise and audit-ready.',
        category: 'profile_fact',
        updatedAt: '2026-05-07T10:30:00.000Z',
        isPublic: false,
        originLabel: 'Registration description seed',
        originSnippet: 'Keeps release notes precise.',
      },
      {
        id: 'memory-3',
        key: 'preferred_collaboration_style',
        value: 'Prefers async check-ins and clear handoff notes.',
        category: 'relationship_context',
        updatedAt: '2026-05-06T09:00:00.000Z',
        isPublic: false,
        originLabel: 'Saved fact snapshot',
        originSnippet: 'Prefers async check-ins and clear handoff notes.',
      },
      {
        id: 'memory-4',
        key: 'favorite_release_window',
        value:
          'Ships bigger changes after lunch when review coverage is online.',
        category: 'profile_fact',
        updatedAt: '2026-05-05T09:00:00.000Z',
        isPublic: true,
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
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(screen.getByTestId('memory-health-status-badge')).toHaveTextContent(
      'Recall ready'
    );
    expect(screen.getByTestId('memory-health-status-copy')).toHaveTextContent(
      'Profile facts and relationship context both have saved evidence in the ledger.'
    );
    expect(screen.getByTestId('memory-resync-cta')).toHaveAttribute(
      'href',
      '#memory-trust-agent-1'
    );

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

  it('surfaces a fact-review log before the full ledger', () => {
    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    const reviewLog = screen.getByTestId('fact-review-log');

    expect(reviewLog).toHaveTextContent('Fact review log');
    expect(reviewLog).toHaveTextContent('4 to review');
    expect(
      within(reviewLog).getByTestId('fact-review-log-entry-memory-1')
    ).toHaveTextContent('Latest Focus');
    expect(
      within(reviewLog).getByTestId('fact-review-log-reason-memory-1')
    ).toHaveTextContent(
      'Newest saved fact - confirm before it shapes the next reply.'
    );
    expect(
      within(reviewLog).getByTestId('fact-review-log-reason-memory-3')
    ).toHaveTextContent(
      'Relationship context - verify tone and boundaries before replies.'
    );
    expect(
      within(reviewLog).getByTestId('fact-review-log-reason-memory-4')
    ).toHaveTextContent('Public memory - confirm it is safe to expose.');
    expect(
      within(reviewLog).getByTestId('fact-review-log-origin-memory-2')
    ).toHaveTextContent(
      'Registration description seed: Keeps release notes precise.'
    );
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
    expect(screen.getByTestId('memory-health-status-badge')).toHaveTextContent(
      'No recall history'
    );
    expect(screen.getByTestId('memory-health-status-copy')).toHaveTextContent(
      'Save the first fact before relying on this agent to recall private context.'
    );
    expect(
      screen.getByText(
        'No pinned facts yet. Starter memories and future saves will show up here so you can inspect what is being kept.'
      )
    ).toBeInTheDocument();
  });

  it('recommends a re-sync when a memory category is missing', () => {
    const settings = buildSettings();

    render(
      <AgentPinnedFactsCard
        settings={{
          ...settings,
          facts: settings.facts.filter(
            (fact) => fact.category === 'profile_fact'
          ),
        }}
      />
    );

    expect(screen.getByTestId('memory-health-status-badge')).toHaveTextContent(
      'Re-sync recommended'
    );
    expect(screen.getByTestId('memory-health-status-copy')).toHaveTextContent(
      'Review profile facts and relationship context together before the next important chat.'
    );
  });

  it('remembers a new memory through the dashboard API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: {
          id: 'memory-5',
          key: 'release_window',
          value: 'Ships larger changes after lunch.',
          category: 'profile_fact',
          is_public: false,
          created_at: '2026-05-09T10:00:00.000Z',
          updated_at: '2026-05-09T10:00:00.000Z',
        },
      }),
    } as Response);

    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    fireEvent.change(screen.getByLabelText('New memory key for Sage Bot'), {
      target: { value: 'release_window' },
    });
    fireEvent.change(screen.getByLabelText('New memory value for Sage Bot'), {
      target: { value: 'Ships larger changes after lunch.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /remember/i }));

    await waitFor(() =>
      expect(screen.getByTestId('pinned-fact-memory-5')).toHaveTextContent(
        'Release Window'
      )
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/developers/me/agent-memories',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          agentId: 'agent-1',
          key: 'release_window',
          value: 'Ships larger changes after lunch.',
          category: 'profile_fact',
          isPublic: false,
        }),
      })
    );
    expect(screen.getByTestId('pinned-facts-ledger-summary')).toHaveTextContent(
      '5 saved memories'
    );
  });

  it('edits an existing memory in place', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: 'memory-1',
          key: 'latest_focus',
          value: 'Always preserve the newest launch blocker.',
          category: 'relationship_context',
          is_public: false,
          created_at: '2026-05-08T12:30:00.000Z',
          updated_at: '2026-05-09T12:30:00.000Z',
        },
      }),
    } as Response);

    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    fireEvent.click(
      within(screen.getByTestId('pinned-fact-memory-1')).getByRole('button', {
        name: /edit/i,
      })
    );
    fireEvent.change(screen.getByLabelText('Edit memory value latest_focus'), {
      target: { value: 'Always preserve the newest launch blocker.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(screen.getByTestId('pinned-fact-memory-1')).toHaveTextContent(
        'Always preserve the newest launch blocker.'
      )
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/developers/me/agent-memories/memory-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          agentId: 'agent-1',
          key: 'latest_focus',
          value: 'Always preserve the newest launch blocker.',
          category: 'relationship_context',
          isPublic: false,
        }),
      })
    );
  });

  it('forgets a memory after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({ success: true }),
    } as Response);

    render(<AgentPinnedFactsCard settings={buildSettings()} />);

    fireEvent.click(
      within(screen.getByTestId('pinned-fact-memory-1')).getByRole('button', {
        name: /forget/i,
      })
    );

    await waitFor(() =>
      expect(
        screen.queryByTestId('pinned-fact-memory-1')
      ).not.toBeInTheDocument()
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/developers/me/agent-memories/memory-1?agentId=agent-1',
      { method: 'DELETE' }
    );
  });
});
