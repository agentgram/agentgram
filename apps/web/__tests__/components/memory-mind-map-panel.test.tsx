import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MemoryMindMapPanel,
  type AgentMemory,
} from '@/components/dashboard/MemoryMindMapPanel';

function buildMemory(overrides: Partial<AgentMemory> = {}): AgentMemory {
  return {
    id: 'mem-1',
    agent_id: 'agent-1',
    key: 'user_name',
    value: 'Alice',
    category: 'profile_fact',
    is_public: false,
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

const MEMORIES: AgentMemory[] = [
  buildMemory({ id: 'mem-1', key: 'user_name', value: 'Alice', category: 'profile_fact' }),
  buildMemory({ id: 'mem-2', key: 'preferred_language', value: 'Korean', category: 'profile_fact' }),
  buildMemory({
    id: 'mem-3',
    key: 'tone_with_alice',
    value: 'warm and concise',
    category: 'relationship_context',
    is_public: true,
  }),
];

describe('MemoryMindMapPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state while fetching', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise(() => {})) // never resolves
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText(/loading memory map/i)).toBeInTheDocument();
  });

  it('renders the panel title and agent label', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getByText('Memory Mind Map')).toBeInTheDocument();
    });
    expect(screen.getByText(/Sage Bot/)).toBeInTheDocument();
  });

  it('shows an empty state when the agent has no memories', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    expect(await screen.findByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/No memories yet/)).toBeInTheDocument();
  });

  it('renders memory nodes grouped by category after fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getAllByTestId('memory-node')).toHaveLength(3);
    });

    expect(screen.getByText('user_name')).toBeInTheDocument();
    expect(screen.getByText('preferred_language')).toBeInTheDocument();
    expect(screen.getByText('tone_with_alice')).toBeInTheDocument();
  });

  it('renders the profile_fact category branch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    const branch = await screen.findByTestId('category-branch-profile_fact');
    expect(branch).toBeInTheDocument();

    expect(within(branch).getByText('Profile Facts')).toBeInTheDocument();
    expect(screen.getByText(/Stable identity attributes/)).toBeInTheDocument();
  });

  it('renders the relationship_context category branch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    const branch = await screen.findByTestId('category-branch-relationship_context');
    expect(branch).toBeInTheDocument();

    expect(within(branch).getByText('Relationship Context')).toBeInTheDocument();
  });

  it('shows correct memory count in the summary bar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getByTestId('memory-summary')).toBeInTheDocument();
    });

    expect(screen.getByText(/3 memories total/)).toBeInTheDocument();
    expect(screen.getByText(/2 profile facts/)).toBeInTheDocument();
    expect(screen.getByText(/1 relationship context/)).toBeInTheDocument();
  });

  it('shows an error state when the fetch request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    expect(await screen.findByTestId('error-state')).toBeInTheDocument();
    expect(
      screen.getByText(/Could not load the memory map/)
    ).toBeInTheDocument();
  });

  it('marks a public memory with a "public" badge', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getByTestId('category-branch-relationship_context')).toBeInTheDocument();
    });

    expect(screen.getByText('public')).toBeInTheDocument();
  });

  it('filters to profile_fact only when that filter button is clicked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getAllByTestId('memory-node')).toHaveLength(3);
    });

    fireEvent.click(screen.getByTestId('filter-profile_fact'));

    expect(screen.getAllByTestId('memory-node')).toHaveLength(2);
    expect(screen.queryByTestId('category-branch-relationship_context')).not.toBeInTheDocument();
    expect(screen.getByTestId('category-branch-profile_fact')).toBeInTheDocument();
  });

  it('filters to relationship_context only when that filter button is clicked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getAllByTestId('memory-node')).toHaveLength(3);
    });

    fireEvent.click(screen.getByTestId('filter-relationship_context'));

    expect(screen.getAllByTestId('memory-node')).toHaveLength(1);
    expect(screen.queryByTestId('category-branch-profile_fact')).not.toBeInTheDocument();
    expect(
      screen.getByTestId('category-branch-relationship_context')
    ).toBeInTheDocument();
  });

  it('re-fetches memories when the refresh button is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: MEMORIES }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getAllByTestId('memory-node')).toHaveLength(3);
    });

    fireEvent.click(screen.getByRole('button', { name: /refresh memory map/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('shows singular "memory" when count is 1', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [MEMORIES[0]] }),
      })
    );

    render(<MemoryMindMapPanel agentId="agent-1" agentLabel="Sage Bot" />);

    await waitFor(() => {
      expect(screen.getByTestId('memory-summary')).toBeInTheDocument();
    });

    expect(screen.getByText(/1 memory total/)).toBeInTheDocument();
  });

  it('uses the correct API endpoint with the provided agentId', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryMindMapPanel agentId="agent-xyz" agentLabel="Test Agent" />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/developers/me/agent-memories?agentId=agent-xyz'
      );
    });
  });
});
