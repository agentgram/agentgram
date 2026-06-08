import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MemoryExportDashboard,
  type MemoryExportRecord,
} from '@/components/dashboard/MemoryExportDashboard';

function buildMemory(overrides: Partial<MemoryExportRecord> = {}): MemoryExportRecord {
  return {
    id: 'memory-1',
    agentId: 'agent-1',
    agentLabel: 'Sage Bot',
    key: 'latest_focus',
    value: 'Preserve the release blocker.',
    category: 'profile_fact',
    isPublic: false,
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('MemoryExportDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the dashboard container', () => {
    render(<MemoryExportDashboard memories={[]} />);
    expect(screen.getByTestId('memory-export-dashboard')).toBeInTheDocument();
  });

  it('shows empty state when no memories', () => {
    render(<MemoryExportDashboard memories={[]} />);
    expect(
      screen.getByText(/no remembered facts yet/i)
    ).toBeInTheDocument();
  });

  it('disables export buttons when no memories', () => {
    render(<MemoryExportDashboard memories={[]} />);
    expect(screen.getByTestId('export-json-btn')).toBeDisabled();
    expect(screen.getByTestId('export-csv-btn')).toBeDisabled();
    expect(screen.getByTestId('export-all-btn')).toBeDisabled();
  });

  it('renders memory items when memories are present', () => {
    const memories = [buildMemory(), buildMemory({ id: 'memory-2', key: 'hobby', value: 'Loves hiking.' })];
    render(<MemoryExportDashboard memories={memories} />);
    expect(screen.getByTestId('memory-list')).toBeInTheDocument();
    expect(screen.getByTestId('memory-item-memory-1')).toBeInTheDocument();
    expect(screen.getByTestId('memory-item-memory-2')).toBeInTheDocument();
  });

  it('shows category badge for each memory', () => {
    render(<MemoryExportDashboard memories={[buildMemory()]} />);
    expect(screen.getByTestId('memory-category-memory-1')).toHaveTextContent(
      'Profile fact'
    );
  });

  it('shows relationship_context category label', () => {
    render(
      <MemoryExportDashboard
        memories={[buildMemory({ category: 'relationship_context' })]}
      />
    );
    expect(screen.getByTestId('memory-category-memory-1')).toHaveTextContent(
      'Relationship context'
    );
  });

  it('shows capture date for each memory', () => {
    render(<MemoryExportDashboard memories={[buildMemory()]} />);
    expect(screen.getByTestId('memory-date-memory-1')).toHaveTextContent(
      'Captured'
    );
  });

  it('groups memories by agent label', () => {
    const memories = [
      buildMemory({ id: 'memory-1', agentId: 'agent-1', agentLabel: 'Sage Bot' }),
      buildMemory({ id: 'memory-2', agentId: 'agent-2', agentLabel: 'Echo AI' }),
    ];
    render(<MemoryExportDashboard memories={memories} />);
    expect(screen.getByText('Sage Bot')).toBeInTheDocument();
    expect(screen.getByText('Echo AI')).toBeInTheDocument();
  });

  it('enables export buttons when memories exist', () => {
    render(<MemoryExportDashboard memories={[buildMemory()]} />);
    expect(screen.getByTestId('export-json-btn')).not.toBeDisabled();
    expect(screen.getByTestId('export-csv-btn')).not.toBeDisabled();
    expect(screen.getByTestId('export-all-btn')).not.toBeDisabled();
  });

  it('triggers a blob download on JSON export click', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    render(<MemoryExportDashboard memories={[buildMemory()]} />);
    fireEvent.click(screen.getByTestId('export-json-btn'));

    expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('removes memory from list after successful delete', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }));

    render(<MemoryExportDashboard memories={[buildMemory()]} />);
    expect(screen.getByTestId('memory-item-memory-1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('delete-memory-memory-1'));

    await waitFor(() => {
      expect(screen.queryByTestId('memory-item-memory-1')).not.toBeInTheDocument();
    });
  });

  it('shows error message when delete fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Failed to delete memory.' } }),
      })
    );

    render(<MemoryExportDashboard memories={[buildMemory()]} />);
    fireEvent.click(screen.getByTestId('delete-memory-memory-1'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to delete memory.');
    });
  });

  it('renders the back link to settings', () => {
    render(<MemoryExportDashboard memories={[]} />);
    const link = screen.getByRole('link', { name: /back to settings/i });
    expect(link).toHaveAttribute('href', '/dashboard/settings');
  });

  it('renders the export actions card', () => {
    render(<MemoryExportDashboard memories={[buildMemory()]} />);
    expect(screen.getByTestId('memory-export-actions-card')).toBeInTheDocument();
  });
});
