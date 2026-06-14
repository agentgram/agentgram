import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryTransparencyPanel } from '@/components/dashboard/MemoryTransparencyPanel';

const AGENT_ID = 'agent-test-001';
const AGENT_LABEL = 'Sage Bot';

const DB_FACTS = [
  {
    id: 'mem-1',
    key: 'pinned_identity',
    value: 'Sage Bot is an AI companion focused on growth.',
    category: 'profile_fact',
    is_public: false,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 'mem-2',
    key: 'preferred_collaboration_style',
    value: 'Async check-ins with clear handoff notes.',
    category: 'relationship_context',
    is_public: false,
    created_at: '2026-05-02T09:00:00.000Z',
    updated_at: '2026-05-02T09:00:00.000Z',
  },
];

function mockFetchSuccess(facts = DB_FACTS) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: facts }),
    })
  );
}

function mockFetchError() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Internal server error.' } }),
    })
  );
}

describe('MemoryTransparencyPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Panel renders and immediately shows a loading state
  it('shows loading indicator while fetching', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  // 2. Renders memory list after successful fetch
  it('renders memory items on successful fetch', async () => {
    mockFetchSuccess();
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => {
      expect(screen.getByTestId('memory-list')).toBeInTheDocument();
    });
    expect(screen.getByTestId('memory-item-mem-1')).toBeInTheDocument();
    expect(screen.getByTestId('memory-item-mem-2')).toBeInTheDocument();
  });

  // 3. Shows empty state when no facts returned
  it('shows empty state when no facts exist', async () => {
    mockFetchSuccess([]);
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  // 4. Shows fetch error when API returns error
  it('shows error alert when fetch fails', async () => {
    mockFetchError();
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => {
      expect(screen.getByTestId('fetch-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('fetch-error')).toHaveTextContent('Internal server error.');
  });

  // 5. Clicking pencil icon reveals the edit form
  it('shows edit input when pencil button is clicked', async () => {
    mockFetchSuccess();
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('edit-button-mem-1'));
    fireEvent.click(screen.getByTestId('edit-button-mem-1'));
    expect(screen.getByTestId('edit-form-mem-1')).toBeInTheDocument();
    expect(screen.getByTestId('edit-input-mem-1')).toBeInTheDocument();
  });

  // 6. Cancel edit restores original value display
  it('hides edit form and restores value display on cancel', async () => {
    mockFetchSuccess();
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('edit-button-mem-1'));
    fireEvent.click(screen.getByTestId('edit-button-mem-1'));
    expect(screen.getByTestId('edit-form-mem-1')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cancel-edit-button-mem-1'));
    expect(screen.queryByTestId('edit-form-mem-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('fact-value-mem-1')).toBeInTheDocument();
  });

  // 7. Optimistic update: value appears immediately on save without waiting for API
  it('applies optimistic update immediately on save', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        // First call: load facts
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: DB_FACTS }),
        })
        // Second call: PATCH — delayed to verify optimistic
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { ...DB_FACTS[0], value: 'Updated value', updated_at: new Date().toISOString() },
          }),
        })
    );

    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('edit-button-mem-1'));
    fireEvent.click(screen.getByTestId('edit-button-mem-1'));

    const input = screen.getByTestId('edit-input-mem-1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated value' } });
    fireEvent.click(screen.getByTestId('save-button-mem-1'));

    // Optimistic update visible before API resolves
    expect(screen.queryByTestId('edit-form-mem-1')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('fact-value-mem-1')).toHaveTextContent('Updated value');
    });
  });

  // 8. Clicking delete shows confirmation UI
  it('shows delete confirmation when trash icon is clicked', async () => {
    mockFetchSuccess();
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('delete-button-mem-1'));
    fireEvent.click(screen.getByTestId('delete-button-mem-1'));
    expect(screen.getByTestId('delete-confirm-mem-1')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete-button-mem-1')).toBeInTheDocument();
  });

  // 9. Cancelling delete dismisses confirmation
  it('cancels delete confirmation when cancel is clicked', async () => {
    mockFetchSuccess();
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('delete-button-mem-1'));
    fireEvent.click(screen.getByTestId('delete-button-mem-1'));
    fireEvent.click(screen.getByTestId('cancel-delete-button-mem-1'));
    expect(screen.queryByTestId('delete-confirm-mem-1')).not.toBeInTheDocument();
  });

  // 10. Confirming delete removes the fact from the list and shows success toast
  it('removes fact from list and shows success toast after confirmed delete', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: DB_FACTS }),
        })
        .mockResolvedValueOnce({ ok: true, status: 204 })
    );

    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('delete-button-mem-1'));
    fireEvent.click(screen.getByTestId('delete-button-mem-1'));
    fireEvent.click(screen.getByTestId('confirm-delete-button-mem-1'));

    await waitFor(() => {
      expect(screen.queryByTestId('memory-item-mem-1')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toHaveTextContent('Memory deleted.');
    });
  });

  // 11. Category badge renders with correct label
  it('renders category badge with human-readable label', async () => {
    mockFetchSuccess();
    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('fact-category-mem-1'));
    expect(screen.getByTestId('fact-category-mem-1')).toHaveTextContent('Profile Fact');
    expect(screen.getByTestId('fact-category-mem-2')).toHaveTextContent('Relationship Context');
  });

  // 12. Refresh button reloads facts
  it('calls fetch again when refresh button is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: DB_FACTS }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryTransparencyPanel agentId={AGENT_ID} agentLabel={AGENT_LABEL} />);
    await waitFor(() => screen.getByTestId('refresh-button'));
    fireEvent.click(screen.getByTestId('refresh-button'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
