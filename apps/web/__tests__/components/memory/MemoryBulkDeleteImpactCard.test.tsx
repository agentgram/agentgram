import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryBulkDeleteImpactCard } from '@/components/memory/MemoryBulkDeleteImpactCard';

function renderCard(overrides: Partial<React.ComponentProps<typeof MemoryBulkDeleteImpactCard>> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <MemoryBulkDeleteImpactCard
      memoryCount={12}
      sessionCount={3}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />
  );
  return { onConfirm, onCancel };
}

describe('MemoryBulkDeleteImpactCard', () => {
  it('renders the impact card container', () => {
    renderCard();
    expect(screen.getByTestId('memory-bulk-delete-impact-card')).toBeInTheDocument();
  });

  it('shows correct memory count in the summary', () => {
    renderCard({ memoryCount: 12, sessionCount: 3 });
    expect(screen.getByTestId('impact-card-memory-count')).toHaveTextContent('12 memories');
  });

  it('shows correct session count in the summary', () => {
    renderCard({ memoryCount: 12, sessionCount: 3 });
    expect(screen.getByTestId('impact-card-session-count')).toHaveTextContent('3 sessions');
  });

  it('uses singular "memory" when count is 1', () => {
    renderCard({ memoryCount: 1, sessionCount: 1 });
    expect(screen.getByTestId('impact-card-memory-count')).toHaveTextContent('1 memory');
  });

  it('uses singular "session" when count is 1', () => {
    renderCard({ memoryCount: 1, sessionCount: 1 });
    expect(screen.getByTestId('impact-card-session-count')).toHaveTextContent('1 session');
  });

  it('renders the summary sentence', () => {
    renderCard({ memoryCount: 5, sessionCount: 2 });
    expect(screen.getByTestId('impact-card-summary')).toHaveTextContent(
      "You'll lose 5 memories across 2 sessions. This action cannot be undone."
    );
  });

  it('export CTA links to /dashboard/data-export by default', () => {
    renderCard();
    const exportBtn = screen.getByTestId('impact-card-export-btn');
    expect(exportBtn.closest('a')).toHaveAttribute('href', '/dashboard/data-export');
  });

  it('export CTA links to custom exportHref when provided', () => {
    renderCard({ exportHref: '/api/v1/memories/export' });
    const exportBtn = screen.getByTestId('impact-card-export-btn');
    expect(exportBtn.closest('a')).toHaveAttribute('href', '/api/v1/memories/export');
  });

  it('calls onConfirm when "Proceed with deletion" is clicked', () => {
    const { onConfirm } = renderCard();
    fireEvent.click(screen.getByTestId('impact-card-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when "Cancel" dismiss button is clicked', () => {
    const { onCancel } = renderCard();
    fireEvent.click(screen.getByTestId('impact-card-dismiss-btn'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the X icon button is clicked', () => {
    const { onCancel } = renderCard();
    fireEvent.click(screen.getByTestId('impact-card-cancel-btn'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does not call onConfirm when cancel is clicked', () => {
    const { onConfirm } = renderCard();
    fireEvent.click(screen.getByTestId('impact-card-dismiss-btn'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not call onCancel when confirm is clicked', () => {
    const { onCancel } = renderCard();
    fireEvent.click(screen.getByTestId('impact-card-confirm-btn'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('renders "Export all memories" label on the export button', () => {
    renderCard();
    expect(screen.getByTestId('impact-card-export-btn')).toHaveTextContent('Export all memories');
  });

  it('renders "Proceed with deletion" label on the confirm button', () => {
    renderCard();
    expect(screen.getByTestId('impact-card-confirm-btn')).toHaveTextContent('Proceed with deletion');
  });
});
