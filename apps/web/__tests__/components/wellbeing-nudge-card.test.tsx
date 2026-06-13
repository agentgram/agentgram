import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { WellbeingNudgeCard, WELLBEING_NUDGE_THRESHOLD_MS } from '../../components/common/WellbeingNudgeCard';
import { useSessionTimer } from '../../hooks/use-session-timer';
import { renderHook } from '@testing-library/react';

// ---------------------------------------------------------------------------
// WellbeingNudgeCard — rendering
// ---------------------------------------------------------------------------

describe('WellbeingNudgeCard — rendering', () => {
  it('renders the nudge card', () => {
    render(<WellbeingNudgeCard onDismiss={vi.fn()} />);
    expect(screen.getByTestId('wellbeing-nudge-card')).toBeInTheDocument();
  });

  it('shows "Time for a break" heading', () => {
    render(<WellbeingNudgeCard onDismiss={vi.fn()} />);
    expect(screen.getByTestId('wellbeing-nudge-heading')).toHaveTextContent(
      'Time for a break'
    );
  });

  it('renders body copy about chatting for over an hour', () => {
    render(<WellbeingNudgeCard onDismiss={vi.fn()} />);
    expect(screen.getByTestId('wellbeing-nudge-body')).toHaveTextContent(
      'over an hour'
    );
  });

  it('renders a dismiss button', () => {
    render(<WellbeingNudgeCard onDismiss={vi.fn()} />);
    expect(screen.getByTestId('wellbeing-nudge-dismiss')).toBeInTheDocument();
  });

  it('does not render a resource link when resourceUrl is omitted', () => {
    render(<WellbeingNudgeCard onDismiss={vi.fn()} />);
    expect(
      screen.queryByTestId('wellbeing-nudge-resource-link')
    ).not.toBeInTheDocument();
  });

  it('renders a resource link when resourceUrl is provided', () => {
    render(
      <WellbeingNudgeCard
        onDismiss={vi.fn()}
        resourceUrl="https://example.com/wellness"
        resourceLabel="Wellness guide"
      />
    );
    const link = screen.getByTestId('wellbeing-nudge-resource-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/wellness');
    expect(link).toHaveTextContent('Wellness guide');
  });

  it('uses default resource label "Learn more" when none is provided', () => {
    render(
      <WellbeingNudgeCard
        onDismiss={vi.fn()}
        resourceUrl="https://example.com/wellness"
      />
    );
    expect(screen.getByTestId('wellbeing-nudge-resource-link')).toHaveTextContent(
      'Learn more'
    );
  });

  it('resource link opens in a new tab', () => {
    render(
      <WellbeingNudgeCard
        onDismiss={vi.fn()}
        resourceUrl="https://example.com/wellness"
      />
    );
    expect(screen.getByTestId('wellbeing-nudge-resource-link')).toHaveAttribute(
      'target',
      '_blank'
    );
  });
});

// ---------------------------------------------------------------------------
// WellbeingNudgeCard — dismiss interaction
// ---------------------------------------------------------------------------

describe('WellbeingNudgeCard — dismiss', () => {
  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<WellbeingNudgeCard onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('wellbeing-nudge-dismiss'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// WELLBEING_NUDGE_THRESHOLD_MS constant
// ---------------------------------------------------------------------------

describe('WELLBEING_NUDGE_THRESHOLD_MS', () => {
  it('equals 60 minutes in milliseconds', () => {
    expect(WELLBEING_NUDGE_THRESHOLD_MS).toBe(60 * 60 * 1000);
  });
});

// ---------------------------------------------------------------------------
// useSessionTimer hook
// ---------------------------------------------------------------------------

describe('useSessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shouldShowNudge is false before the threshold elapses', () => {
    const { result } = renderHook(() =>
      useSessionTimer({ thresholdMs: 60_000 })
    );
    expect(result.current.shouldShowNudge).toBe(false);
  });

  it('shouldShowNudge becomes true after the threshold elapses', () => {
    const { result } = renderHook(() =>
      useSessionTimer({ thresholdMs: 60_000 })
    );

    act(() => {
      vi.advanceTimersByTime(60_001);
    });

    expect(result.current.shouldShowNudge).toBe(true);
  });

  it('shouldShowNudge is true immediately when session already exceeded threshold', () => {
    const sessionStartedAt = Date.now() - 61 * 60 * 1000; // 61 minutes ago
    const { result } = renderHook(() =>
      useSessionTimer({ thresholdMs: 60 * 60 * 1000, sessionStartedAt })
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.shouldShowNudge).toBe(true);
  });

  it('dismissNudge hides the nudge and prevents it from re-appearing', () => {
    const { result } = renderHook(() =>
      useSessionTimer({ thresholdMs: 60_000 })
    );

    act(() => {
      vi.advanceTimersByTime(60_001);
    });
    expect(result.current.shouldShowNudge).toBe(true);

    act(() => {
      result.current.dismissNudge();
    });
    expect(result.current.shouldShowNudge).toBe(false);

    // Advance time further — nudge should remain dismissed
    act(() => {
      vi.advanceTimersByTime(120_000);
    });
    expect(result.current.shouldShowNudge).toBe(false);
  });
});
