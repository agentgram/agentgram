import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MemoryExportDashboard,
  type MemoryExportRecord,
} from '@/components/dashboard/MemoryExportDashboard';
import { MemoryTierTabs } from '@/components/dashboard/MemoryTierTabs';

function buildMemory(overrides: Partial<MemoryExportRecord> = {}): MemoryExportRecord {
  return {
    id: 'memory-1',
    agentId: 'agent-1',
    agentLabel: 'Sage Bot',
    key: 'latest_focus',
    value: 'Preserve the release blocker.',
    category: 'profile_fact',
    isPublic: false,
    priority: 'normal',
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
    ...overrides,
  };
}

const noop = () => {};

describe('Deprioritize toggle — MemoryTierTabs', () => {
  it('renders a deprioritize button for each memory item', () => {
    const memory = buildMemory();
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set()}
        onDeprioritize={noop}
      />
    );
    expect(screen.getByTestId('deprioritize-memory-memory-1')).toBeInTheDocument();
  });

  it('shows ChevronDown icon (deprioritize) when priority is normal', () => {
    const memory = buildMemory({ priority: 'normal' });
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set()}
        onDeprioritize={noop}
      />
    );
    const btn = screen.getByTestId('deprioritize-memory-memory-1');
    expect(btn).toHaveAttribute('aria-label', 'Deprioritize: latest_focus');
  });

  it('shows ChevronUp icon (restore) when priority is low', () => {
    const memory = buildMemory({ priority: 'low' });
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set()}
        onDeprioritize={noop}
      />
    );
    const btn = screen.getByTestId('deprioritize-memory-memory-1');
    expect(btn).toHaveAttribute('aria-label', 'Restore priority: latest_focus');
  });

  it('shows "Low priority" badge for deprioritized memory', () => {
    const memory = buildMemory({ priority: 'low' });
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set()}
        onDeprioritize={noop}
      />
    );
    expect(screen.getByTestId('deprioritized-badge-memory-1')).toBeInTheDocument();
    expect(screen.getByTestId('deprioritized-badge-memory-1')).toHaveTextContent('Low priority');
  });

  it('does not show "Low priority" badge for normal-priority memory', () => {
    const memory = buildMemory({ priority: 'normal' });
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set()}
        onDeprioritize={noop}
      />
    );
    expect(screen.queryByTestId('deprioritized-badge-memory-1')).not.toBeInTheDocument();
  });

  it('calls onDeprioritize when deprioritize button is clicked', () => {
    const onDeprioritize = vi.fn();
    const memory = buildMemory();
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set()}
        onDeprioritize={onDeprioritize}
      />
    );
    fireEvent.click(screen.getByTestId('deprioritize-memory-memory-1'));
    expect(onDeprioritize).toHaveBeenCalledWith(memory);
  });

  it('disables deprioritize button while deprioritizing', () => {
    const memory = buildMemory();
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set(['memory-1'])}
        onDeprioritize={noop}
      />
    );
    expect(screen.getByTestId('deprioritize-memory-memory-1')).toBeDisabled();
  });

  it('applies reduced opacity class to deprioritized memory row', () => {
    const memory = buildMemory({ priority: 'low' });
    render(
      <MemoryTierTabs
        memories={[memory]}
        deleting={new Set()}
        onDelete={noop}
        deprioritizing={new Set()}
        onDeprioritize={noop}
      />
    );
    const item = screen.getByTestId('memory-item-memory-1');
    expect(item.className).toContain('opacity-50');
  });
});

describe('Deprioritize toggle — MemoryExportDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('optimistically marks memory as low priority after successful deprioritize', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 })
    );

    render(<MemoryExportDashboard memories={[buildMemory({ priority: 'normal' })]} />);

    fireEvent.click(screen.getByTestId('deprioritize-memory-memory-1'));

    await waitFor(() => {
      expect(screen.getByTestId('deprioritized-badge-memory-1')).toBeInTheDocument();
    });
  });

  it('optimistically restores memory to normal priority on toggle', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 })
    );

    render(<MemoryExportDashboard memories={[buildMemory({ priority: 'low' })]} />);

    // Badge should exist before toggle
    expect(screen.getByTestId('deprioritized-badge-memory-1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('deprioritize-memory-memory-1'));

    await waitFor(() => {
      expect(screen.queryByTestId('deprioritized-badge-memory-1')).not.toBeInTheDocument();
    });
  });

  it('calls deprioritize API with correct payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    render(<MemoryExportDashboard memories={[buildMemory({ priority: 'normal' })]} />);
    fireEvent.click(screen.getByTestId('deprioritize-memory-memory-1'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/agents/me/memories/memory-1/deprioritize',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ agentId: 'agent-1', deprioritized: true }),
        })
      );
    });
  });
});
