import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  UserEditableMemoryPanel,
} from '@/components/chat/UserEditableMemoryPanel';

const MOCK_FACTS = [
  {
    id: 'fact-1',
    key: 'favorite_color',
    value: 'Prefers deep indigo for UI themes.',
    category: 'profile_fact',
    is_public: false,
    updated_at: '2026-06-01T12:00:00.000Z',
    created_at: '2026-06-01T12:00:00.000Z',
  },
  {
    id: 'fact-2',
    key: 'communication_style',
    value: 'Prefers concise async check-ins.',
    category: 'relationship_context',
    is_public: false,
    updated_at: '2026-06-02T08:00:00.000Z',
    created_at: '2026-06-02T08:00:00.000Z',
  },
  {
    id: 'fact-3',
    key: 'timezone',
    value: 'Asia/Seoul (UTC+9)',
    category: 'profile_fact',
    is_public: true,
    updated_at: '2026-06-03T06:00:00.000Z',
    created_at: '2026-06-03T06:00:00.000Z',
  },
];

function mockFetchSuccess(facts = MOCK_FACTS) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: facts }),
  } as Response);
}

function mockFetch401() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ success: false }),
  } as Response);
}

describe('UserEditableMemoryPanel — visibility', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders the panel when the API returns facts for an authenticated user', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('user-editable-memory-panel')).toBeInTheDocument()
    );
  });

  it('does not render when the API returns 401 (unauthenticated)', async () => {
    mockFetch401();
    const { container } = render(
      <UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />
    );
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it('shows a loading spinner while fetching', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    expect(screen.getByTestId('memory-panel-loading')).toBeInTheDocument();
  });
});

describe('UserEditableMemoryPanel — fact list rendering', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders all returned facts', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-facts-list')).toBeInTheDocument()
    );
    expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument();
    expect(screen.getByTestId('memory-panel-fact-fact-2')).toBeInTheDocument();
    expect(screen.getByTestId('memory-panel-fact-fact-3')).toBeInTheDocument();
  });

  it('humanizes snake_case keys for display', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-key-fact-1')).toHaveTextContent(
        'Favorite Color'
      )
    );
  });

  it('shows empty state when no facts are returned', async () => {
    mockFetchSuccess([]);
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-empty-state')).toBeInTheDocument()
    );
  });

  it('shows the live indicator after initial load', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-live-indicator')).toBeInTheDocument()
    );
  });
});

describe('UserEditableMemoryPanel — collapse', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('collapses the fact list when the header is clicked', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-facts-list')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('memory-panel-toggle'));
    expect(screen.queryByTestId('memory-panel-facts-list')).not.toBeInTheDocument();
  });

  it('re-expands when toggle is clicked again', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-facts-list')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('memory-panel-toggle'));
    fireEvent.click(screen.getByTestId('memory-panel-toggle'));
    expect(screen.getByTestId('memory-panel-facts-list')).toBeInTheDocument();
  });
});

describe('UserEditableMemoryPanel — edit mode', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('enters edit mode when the pencil button is clicked', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument()
    );

    const row = screen.getByTestId('memory-panel-fact-fact-1');
    fireEvent.click(within(row).getByTestId('memory-panel-edit-btn-fact-1'));

    expect(screen.getByTestId('memory-panel-edit-input-fact-1')).toBeInTheDocument();
  });

  it('cancels edit and restores original value on X click', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument()
    );

    const row = screen.getByTestId('memory-panel-fact-fact-1');
    fireEvent.click(within(row).getByTestId('memory-panel-edit-btn-fact-1'));
    fireEvent.change(screen.getByTestId('memory-panel-edit-input-fact-1'), {
      target: { value: 'changed value' },
    });
    fireEvent.click(screen.getByTestId('memory-panel-cancel-edit-fact-1'));

    expect(screen.queryByTestId('memory-panel-edit-input-fact-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('memory-panel-value-fact-1')).toHaveTextContent(
      'Prefers deep indigo for UI themes.'
    );
  });

  it('saves edited value via PATCH and updates UI', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: MOCK_FACTS }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            ...MOCK_FACTS[0],
            value: 'Now prefers midnight blue.',
            updated_at: '2026-06-14T10:00:00.000Z',
          },
        }),
      } as Response);

    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument()
    );

    const row = screen.getByTestId('memory-panel-fact-fact-1');
    fireEvent.click(within(row).getByTestId('memory-panel-edit-btn-fact-1'));
    fireEvent.change(screen.getByTestId('memory-panel-edit-input-fact-1'), {
      target: { value: 'Now prefers midnight blue.' },
    });
    fireEvent.click(screen.getByTestId('memory-panel-save-fact-1'));

    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-value-fact-1')).toHaveTextContent(
        'Now prefers midnight blue.'
      )
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/developers/me/agent-memories/fact-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          agentId: 'agent-1',
          key: 'favorite_color',
          value: 'Now prefers midnight blue.',
          category: 'profile_fact',
        }),
      })
    );
  });
});

describe('UserEditableMemoryPanel — delete confirmation', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shows a delete confirmation prompt on trash click', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument()
    );

    const row = screen.getByTestId('memory-panel-fact-fact-1');
    fireEvent.click(within(row).getByTestId('memory-panel-delete-btn-fact-1'));

    expect(screen.getByTestId('memory-panel-delete-confirm-fact-1')).toBeInTheDocument();
  });

  it('dismisses the delete prompt when Keep is clicked', async () => {
    mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument()
    );

    const row = screen.getByTestId('memory-panel-fact-fact-1');
    fireEvent.click(within(row).getByTestId('memory-panel-delete-btn-fact-1'));
    fireEvent.click(screen.getByTestId('memory-panel-delete-confirm-cancel-fact-1'));

    expect(
      screen.queryByTestId('memory-panel-delete-confirm-fact-1')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument();
  });

  it('removes fact from list after confirmed delete', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: MOCK_FACTS }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      } as Response);

    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-fact-fact-1')).toBeInTheDocument()
    );

    const row = screen.getByTestId('memory-panel-fact-fact-1');
    fireEvent.click(within(row).getByTestId('memory-panel-delete-btn-fact-1'));
    fireEvent.click(screen.getByTestId('memory-panel-delete-confirm-yes-fact-1'));

    await waitFor(() =>
      expect(
        screen.queryByTestId('memory-panel-fact-fact-1')
      ).not.toBeInTheDocument()
    );
  });

  it('calls DELETE with correct URL on confirm', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: MOCK_FACTS }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      } as Response);

    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-fact-fact-2')).toBeInTheDocument()
    );

    const row = screen.getByTestId('memory-panel-fact-fact-2');
    fireEvent.click(within(row).getByTestId('memory-panel-delete-btn-fact-2'));
    fireEvent.click(screen.getByTestId('memory-panel-delete-confirm-yes-fact-2'));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/v1/developers/me/agent-memories/fact-2?agentId=agent-1',
        { method: 'DELETE' }
      )
    );
  });
});

describe('UserEditableMemoryPanel — refresh', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('re-fetches facts when refresh button is clicked', async () => {
    const fetchMock = mockFetchSuccess();
    render(<UserEditableMemoryPanel agentId="agent-1" agentLabel="Sage" />);
    await waitFor(() =>
      expect(screen.getByTestId('memory-panel-facts-list')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId('memory-panel-refresh'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
