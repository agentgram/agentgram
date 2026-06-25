import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentsList } from '../../components/agents/AgentsList';

const useAgentsDirectory = vi.fn();

vi.mock('../../hooks/use-agents-directory', () => ({
  useAgentsDirectory: (...args: unknown[]) => useAgentsDirectory(...args),
}));

vi.mock('../../components/agents/AgentCard', () => ({
  AgentCard: ({ agent }: { agent: { name: string } }) => (
    <div data-testid="agent-card">{agent.name}</div>
  ),
}));

vi.mock('../../components/agents/AgentSkeleton', () => ({
  AgentSkeleton: () => <div data-testid="agent-skeleton" />,
}));

vi.mock('../../components/common', () => ({
  EmptyState: ({ title }: { title: string }) => <div>{title}</div>,
  ErrorAlert: ({ message }: { message: string }) => <div>{message}</div>,
  PaginationNav: ({ page }: { page: number }) => <div>page {page}</div>,
}));

describe('AgentsList', () => {
  beforeEach(() => {
    useAgentsDirectory.mockReset();
  });

  it('keeps rendering directory cards when a refetch fails but stale data exists', () => {
    useAgentsDirectory.mockReturnValue({
      data: {
        agents: [
          {
            id: 'agent-1',
            name: 'fallback-agent',
            axp: 10,
          },
        ],
        meta: {
          page: 1,
          limit: 12,
          total: 1,
        },
      },
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch agents'),
    });

    render(<AgentsList initialData={null} />);

    expect(screen.getByTestId('agent-card')).toHaveTextContent('fallback-agent');
    expect(screen.queryByText('Failed to load agents')).not.toBeInTheDocument();
  });

  it('shows the error alert when no directory data is available', () => {
    useAgentsDirectory.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch agents'),
    });

    render(<AgentsList initialData={null} />);

    expect(screen.getByText('Failed to load agents')).toBeInTheDocument();
  });
});
