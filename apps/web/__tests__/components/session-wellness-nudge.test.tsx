import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { SessionWellnessNudge } from '../../components/chat/SessionWellnessNudge';
import {
  useSessionWellness,
  SESSION_WELLNESS_MESSAGE_THRESHOLD,
  SESSION_WELLNESS_TIME_THRESHOLD_MS,
} from '../../hooks/use-session-wellness';

const STORAGE_KEY = 'agentgram_session_wellness_dismissed';

// ---------------------------------------------------------------------------
// SessionWellnessNudge — rendering
// ---------------------------------------------------------------------------

describe('SessionWellnessNudge — not shown before threshold', () => {
  beforeEach(() => sessionStorage.clear());

  it('renders nothing when messageCount is below threshold', () => {
    const { container } = render(
      <SessionWellnessNudge messageCount={59} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when messageCount is 0 (default)', () => {
    const { container } = render(<SessionWellnessNudge />);
    expect(container.firstChild).toBeNull();
  });
});

describe('SessionWellnessNudge — shows after message threshold', () => {
  beforeEach(() => sessionStorage.clear());

  it('renders the nudge card when messageCount reaches threshold', () => {
    render(<SessionWellnessNudge messageCount={60} />);
    expect(screen.getByTestId('session-wellness-nudge')).toBeInTheDocument();
  });

  it('renders the nudge card when messageCount exceeds threshold', () => {
    render(<SessionWellnessNudge messageCount={100} />);
    expect(screen.getByTestId('session-wellness-nudge')).toBeInTheDocument();
  });

  it('shows the spec copy in the body', () => {
    render(<SessionWellnessNudge messageCount={60} />);
    expect(screen.getByTestId('session-wellness-nudge-body')).toHaveTextContent(
      "You've been chatting for a while"
    );
  });
});

describe('SessionWellnessNudge — dismiss interaction', () => {
  beforeEach(() => sessionStorage.clear());

  it('hides the card when dismiss button is clicked', () => {
    const { container } = render(<SessionWellnessNudge messageCount={60} />);
    fireEvent.click(screen.getByTestId('session-wellness-nudge-dismiss'));
    expect(container.firstChild).toBeNull();
  });

  it('does not reshow after dismiss even when messageCount remains above threshold', () => {
    render(<SessionWellnessNudge messageCount={60} />);
    fireEvent.click(screen.getByTestId('session-wellness-nudge-dismiss'));
    expect(
      screen.queryByTestId('session-wellness-nudge')
    ).not.toBeInTheDocument();
  });
});

describe('SessionWellnessNudge — once per session via sessionStorage', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('does not show if already dismissed in sessionStorage', () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    const { container } = render(<SessionWellnessNudge messageCount={60} />);
    expect(container.firstChild).toBeNull();
  });

  it('writes to sessionStorage on dismiss', () => {
    render(<SessionWellnessNudge messageCount={60} />);
    fireEvent.click(screen.getByTestId('session-wellness-nudge-dismiss'));
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('1');
  });
});

describe('SessionWellnessNudge — resource link', () => {
  beforeEach(() => sessionStorage.clear());

  it('does not render a resource link when resourceUrl is omitted', () => {
    render(<SessionWellnessNudge messageCount={60} />);
    expect(
      screen.queryByTestId('session-wellness-nudge-resource-link')
    ).not.toBeInTheDocument();
  });

  it('renders a resource link when resourceUrl is provided', () => {
    render(
      <SessionWellnessNudge
        messageCount={60}
        resourceUrl="https://example.com/wellness"
        resourceLabel="Take a break"
      />
    );
    const link = screen.getByTestId('session-wellness-nudge-resource-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/wellness');
    expect(link).toHaveTextContent('Take a break');
  });
});

// ---------------------------------------------------------------------------
// useSessionWellness hook — message count threshold
// ---------------------------------------------------------------------------

describe('useSessionWellness — message threshold', () => {
  beforeEach(() => sessionStorage.clear());

  it('shouldShowNudge is false below threshold', () => {
    const { result } = renderHook(() =>
      useSessionWellness({ messageCount: 59, thresholdMessages: 60 })
    );
    expect(result.current.shouldShowNudge).toBe(false);
  });

  it('shouldShowNudge is true at threshold', () => {
    const { result } = renderHook(() =>
      useSessionWellness({ messageCount: 60, thresholdMessages: 60 })
    );
    expect(result.current.shouldShowNudge).toBe(true);
  });

  it('shouldShowNudge is true above threshold', () => {
    const { result } = renderHook(() =>
      useSessionWellness({ messageCount: 200, thresholdMessages: 60 })
    );
    expect(result.current.shouldShowNudge).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useSessionWellness hook — time threshold
// ---------------------------------------------------------------------------

describe('useSessionWellness — time threshold', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('shouldShowNudge is false before the time threshold elapses', () => {
    const { result } = renderHook(() =>
      useSessionWellness({ thresholdMs: 90_000 })
    );
    expect(result.current.shouldShowNudge).toBe(false);
  });

  it('shouldShowNudge becomes true after the time threshold elapses', () => {
    const { result } = renderHook(() =>
      useSessionWellness({ thresholdMs: 90_000 })
    );
    act(() => {
      vi.advanceTimersByTime(90_001);
    });
    expect(result.current.shouldShowNudge).toBe(true);
  });

  it('shouldShowNudge is true immediately when session already exceeded threshold', () => {
    const sessionStartedAt = Date.now() - 91 * 60 * 1000; // 91 minutes ago
    const { result } = renderHook(() =>
      useSessionWellness({
        thresholdMs: 90 * 60 * 1000,
        sessionStartedAt,
      })
    );
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current.shouldShowNudge).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useSessionWellness hook — dismiss and sessionStorage
// ---------------------------------------------------------------------------

describe('useSessionWellness — dismiss', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('dismissNudge hides the nudge and writes to sessionStorage', () => {
    const { result } = renderHook(() =>
      useSessionWellness({ messageCount: 60 })
    );
    expect(result.current.shouldShowNudge).toBe(true);
    act(() => {
      result.current.dismissNudge();
    });
    expect(result.current.shouldShowNudge).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  it('shouldShowNudge is false on mount when sessionStorage has dismiss flag', () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    const { result } = renderHook(() =>
      useSessionWellness({ messageCount: 60 })
    );
    expect(result.current.shouldShowNudge).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('Session wellness thresholds', () => {
  it('SESSION_WELLNESS_MESSAGE_THRESHOLD equals 60', () => {
    expect(SESSION_WELLNESS_MESSAGE_THRESHOLD).toBe(60);
  });

  it('SESSION_WELLNESS_TIME_THRESHOLD_MS equals 90 minutes', () => {
    expect(SESSION_WELLNESS_TIME_THRESHOLD_MS).toBe(90 * 60 * 1000);
  });
});
