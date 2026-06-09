import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LorebookMatchPreview } from '@/components/lorebook/LorebookMatchPreview';
import type { MatchedLorebookEntry } from '@/app/api/v1/agents/[agentId]/lorebook/preview/route';

const RULE_ENTRY: MatchedLorebookEntry = {
  id: 'rule-1',
  category: 'rule',
  label: 'Never fake a ship date',
  snippet: 'If timing is uncertain, give the next checkpoint instead.',
};

const PERSON_ENTRY: MatchedLorebookEntry = {
  id: 'person-1',
  category: 'person',
  label: 'Mina Park',
  snippet: 'Launch producer',
};

const PLACE_ENTRY: MatchedLorebookEntry = {
  id: 'place-1',
  category: 'place',
  label: 'Night shift war room',
  snippet: 'Late-night release channel.',
};

function mockFetchSuccess(matched: MatchedLorebookEntry[], totalEntries = 3) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { matched, totalEntries } }),
    })
  );
}

function mockFetchEmpty() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { matched: [], totalEntries: 0 } }),
    })
  );
}

function mockFetchError() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agent not found' },
      }),
    })
  );
}

describe('LorebookMatchPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the collapsible toggle once matched entries load', async () => {
    mockFetchSuccess([RULE_ENTRY, PERSON_ENTRY]);

    render(<LorebookMatchPreview agentId="agent-1" starterMessage="hello Mina" />);

    await waitFor(() =>
      expect(screen.getByTestId('lorebook-match-preview')).toBeInTheDocument()
    );

    expect(screen.getByTestId('lorebook-match-toggle')).toBeInTheDocument();
  });

  it('shows correct active count badge', async () => {
    mockFetchSuccess([RULE_ENTRY, PERSON_ENTRY, PLACE_ENTRY]);

    render(<LorebookMatchPreview agentId="agent-1" starterMessage="hello" />);

    await waitFor(() =>
      expect(screen.getByTestId('lorebook-match-count')).toBeInTheDocument()
    );

    expect(screen.getByTestId('lorebook-match-count').textContent).toBe('3 active');
  });

  it('is collapsed by default and expands on toggle click', async () => {
    mockFetchSuccess([RULE_ENTRY]);

    render(<LorebookMatchPreview agentId="agent-1" />);

    await waitFor(() =>
      expect(screen.getByTestId('lorebook-match-toggle')).toBeInTheDocument()
    );

    expect(screen.queryByTestId('lorebook-match-list')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('lorebook-match-toggle'));

    expect(screen.getByTestId('lorebook-match-list')).toBeInTheDocument();
  });

  it('collapses again when toggle is clicked a second time', async () => {
    mockFetchSuccess([RULE_ENTRY]);

    render(<LorebookMatchPreview agentId="agent-1" />);

    await waitFor(() =>
      expect(screen.getByTestId('lorebook-match-toggle')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('lorebook-match-toggle'));
    expect(screen.getByTestId('lorebook-match-list')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('lorebook-match-toggle'));
    expect(screen.queryByTestId('lorebook-match-list')).not.toBeInTheDocument();
  });

  it('shows each matched entry when expanded', async () => {
    mockFetchSuccess([RULE_ENTRY, PERSON_ENTRY]);

    render(<LorebookMatchPreview agentId="agent-1" starterMessage="hello" />);

    await waitFor(() =>
      expect(screen.getByTestId('lorebook-match-toggle')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('lorebook-match-toggle'));

    expect(screen.getByTestId('lorebook-entry-rule-1')).toBeInTheDocument();
    expect(screen.getByTestId('lorebook-entry-person-1')).toBeInTheDocument();
    expect(screen.getByText('Never fake a ship date')).toBeInTheDocument();
    expect(screen.getByText('Mina Park')).toBeInTheDocument();
  });

  it('renders nothing when totalEntries is 0', async () => {
    mockFetchEmpty();

    const { container } = render(<LorebookMatchPreview agentId="agent-1" />);

    await waitFor(() =>
      expect(
        (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls.length
      ).toBeGreaterThan(0)
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when fetch returns an error', async () => {
    mockFetchError();

    const { container } = render(
      <LorebookMatchPreview agentId="agent-1" starterMessage="hello" />
    );

    await waitFor(() =>
      expect(
        (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls.length
      ).toBeGreaterThan(0)
    );

    expect(container.firstChild).toBeNull();
  });

  it('builds correct summary label with all three categories', async () => {
    mockFetchSuccess([RULE_ENTRY, PERSON_ENTRY, PLACE_ENTRY]);

    render(<LorebookMatchPreview agentId="agent-1" starterMessage="hello" />);

    await waitFor(() =>
      expect(screen.getByTestId('lorebook-match-preview')).toBeInTheDocument()
    );

    const toggle = screen.getByTestId('lorebook-match-toggle');
    expect(toggle.textContent).toContain('1 rule');
    expect(toggle.textContent).toContain('1 character');
    expect(toggle.textContent).toContain('1 place');
  });

  it('calls fetch with the correct URL including encoded message', async () => {
    mockFetchSuccess([RULE_ENTRY]);

    render(
      <LorebookMatchPreview agentId="agent-99" starterMessage="Hello world!" />
    );

    await waitFor(() =>
      expect(
        (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock.calls.length
      ).toBeGreaterThan(0)
    );

    const calledUrl = (vi.mocked(fetch) as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;

    expect(calledUrl).toContain('/api/v1/agents/agent-99/lorebook/preview');
    expect(calledUrl).toContain('message=Hello%20world!');
  });
});
