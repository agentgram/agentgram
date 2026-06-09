import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryTierTabs, getMemoryTier } from '@/components/dashboard/MemoryTierTabs';
import type { MemoryExportRecord } from '@/components/dashboard/MemoryExportDashboard';

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

const noop = () => {};

describe('MemoryTierTabs', () => {
  it('renders the tab list with both tabs', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    expect(screen.getByTestId('memory-tier-tabs-list')).toBeInTheDocument();
    expect(screen.getByTestId('tab-key-memories')).toBeInTheDocument();
    expect(screen.getByTestId('tab-session-context')).toBeInTheDocument();
  });

  it('renders "Key Memories" tab trigger', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    expect(screen.getByTestId('tab-key-memories')).toHaveTextContent('Key Memories');
  });

  it('renders "Session Context" tab trigger', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    expect(screen.getByTestId('tab-session-context')).toHaveTextContent('Session Context');
  });

  it('defaults to "Key Memories" tab active', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    expect(screen.getByTestId('tab-key-memories')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-session-context')).toHaveAttribute('aria-selected', 'false');
  });

  it('shows "Key Memories" tab panel by default', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    expect(screen.getByTestId('tabpanel-key-memories')).toBeInTheDocument();
    expect(screen.queryByTestId('tabpanel-session-context')).not.toBeInTheDocument();
  });

  it('switches to "Session Context" tab panel on click', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    fireEvent.click(screen.getByTestId('tab-session-context'));
    expect(screen.getByTestId('tabpanel-session-context')).toBeInTheDocument();
    expect(screen.queryByTestId('tabpanel-key-memories')).not.toBeInTheDocument();
  });

  it('routes profile_fact memories into Key Memories tab', () => {
    const memory = buildMemory({ category: 'profile_fact' });
    render(
      <MemoryTierTabs memories={[memory]} deleting={new Set()} onDelete={noop} />
    );
    // Key Memories is default — memory item should be visible
    expect(screen.getByTestId('memory-item-memory-1')).toBeInTheDocument();
  });

  it('routes relationship_context memories into Session Context tab', () => {
    const memory = buildMemory({ category: 'relationship_context' });
    render(
      <MemoryTierTabs memories={[memory]} deleting={new Set()} onDelete={noop} />
    );
    // Default tab is Key Memories — session memory should NOT be visible yet
    expect(screen.queryByTestId('memory-item-memory-1')).not.toBeInTheDocument();

    // Switch to Session Context
    fireEvent.click(screen.getByTestId('tab-session-context'));
    expect(screen.getByTestId('memory-item-memory-1')).toBeInTheDocument();
  });

  it('shows count badge on Key Memories tab when memories exist', () => {
    const memory = buildMemory({ category: 'profile_fact' });
    render(
      <MemoryTierTabs memories={[memory]} deleting={new Set()} onDelete={noop} />
    );
    // The tab trigger contains "Key Memories" and a badge with "1"
    const trigger = screen.getByTestId('tab-key-memories');
    expect(trigger).toHaveTextContent('1');
  });

  it('shows count badge on Session Context tab when memories exist', () => {
    const memory = buildMemory({ category: 'relationship_context' });
    render(
      <MemoryTierTabs memories={[memory]} deleting={new Set()} onDelete={noop} />
    );
    const trigger = screen.getByTestId('tab-session-context');
    expect(trigger).toHaveTextContent('1');
  });

  it('shows Key Memories empty state when no long_term memories', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    expect(screen.getByText(/no key memories yet/i)).toBeInTheDocument();
  });

  it('shows Session Context empty state when no session memories', () => {
    render(
      <MemoryTierTabs memories={[]} deleting={new Set()} onDelete={noop} />
    );
    fireEvent.click(screen.getByTestId('tab-session-context'));
    expect(screen.getByText(/no session context memories yet/i)).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked in Key Memories tab', () => {
    const onDelete = vi.fn();
    const memory = buildMemory({ category: 'profile_fact' });
    render(
      <MemoryTierTabs memories={[memory]} deleting={new Set()} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByTestId('delete-memory-memory-1'));
    expect(onDelete).toHaveBeenCalledWith(memory);
  });

  it('calls onDelete when delete button is clicked in Session Context tab', () => {
    const onDelete = vi.fn();
    const memory = buildMemory({ category: 'relationship_context' });
    render(
      <MemoryTierTabs memories={[memory]} deleting={new Set()} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByTestId('tab-session-context'));
    fireEvent.click(screen.getByTestId('delete-memory-memory-1'));
    expect(onDelete).toHaveBeenCalledWith(memory);
  });
});

describe('getMemoryTier', () => {
  it('returns long_term for profile_fact category', () => {
    expect(getMemoryTier(buildMemory({ category: 'profile_fact' }))).toBe('long_term');
  });

  it('returns session for relationship_context category', () => {
    expect(getMemoryTier(buildMemory({ category: 'relationship_context' }))).toBe('session');
  });

  it('returns session for unknown category', () => {
    expect(getMemoryTier(buildMemory({ category: 'unknown_type' }))).toBe('session');
  });
});
