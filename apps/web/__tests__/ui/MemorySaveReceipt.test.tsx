import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemorySaveReceipt } from '../../components/ui/MemorySaveReceipt';

const DEFAULT_PROPS = {
  savedFact: 'You mentioned you like hiking',
  usedBy: 'Reflections & Personality adaptation',
  onDismiss: vi.fn(),
};

function renderReceipt(overrides: Partial<typeof DEFAULT_PROPS> = {}) {
  const props = { ...DEFAULT_PROPS, ...overrides };
  return render(<MemorySaveReceipt {...props} />);
}

describe('MemorySaveReceipt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    DEFAULT_PROPS.onDismiss = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders savedFact and usedBy text', () => {
    renderReceipt();
    expect(screen.getByTestId('memory-save-receipt-fact')).toHaveTextContent(
      'You mentioned you like hiking'
    );
    expect(screen.getByTestId('memory-save-receipt-used-by')).toHaveTextContent(
      'Used by: Reflections & Personality adaptation'
    );
  });

  it('calls onDismiss when X button is clicked', () => {
    const onDismiss = vi.fn();
    renderReceipt({ onDismiss });
    fireEvent.click(screen.getByTestId('memory-save-receipt-dismiss'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('auto-dismisses after autoDismissMs', () => {
    const onDismiss = vi.fn();
    renderReceipt({ onDismiss, autoDismissMs: 2000 });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not call onDismiss before autoDismissMs elapses', () => {
    const onDismiss = vi.fn();
    renderReceipt({ onDismiss, autoDismissMs: 4000 });
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
