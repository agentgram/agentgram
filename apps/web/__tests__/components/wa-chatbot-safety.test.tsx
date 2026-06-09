/**
 * Tests for WA HB 2822 chatbot safety compliance features:
 *  - wa_chatbot_safety constant
 *  - WA_REST_NUDGE_THRESHOLD_MS constant
 *  - WaRestNudge component
 *  - MinorSafeGate WA compliance marker
 *  - MinorSafeGate rest-nudge after ≥30 min
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  wa_chatbot_safety,
  WA_REST_NUDGE_THRESHOLD_MS,
} from '../../lib/minor-safe-mode';
import { WaRestNudge, MinorSafeGate } from '../../components/minor-safe-gate';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// ─── Constants ──────────────────────────────────────────────────────────────

describe('wa_chatbot_safety constant', () => {
  it('equals WA_HB_2822', () => {
    expect(wa_chatbot_safety).toBe('WA_HB_2822');
  });
});

describe('WA_REST_NUDGE_THRESHOLD_MS', () => {
  it('is exactly 30 minutes in milliseconds', () => {
    expect(WA_REST_NUDGE_THRESHOLD_MS).toBe(30 * 60 * 1000);
  });
});

// ─── WaRestNudge component ───────────────────────────────────────────────────

describe('WaRestNudge', () => {
  it('renders the rest nudge with WA compliance copy', () => {
    render(<WaRestNudge onDismiss={() => {}} />);
    expect(screen.getByTestId('wa-rest-nudge')).toBeInTheDocument();
    expect(screen.getByText(/Take a break/i)).toBeInTheDocument();
    expect(
      screen.getByText(/WA state guidelines recommend periodic breaks/i)
    ).toBeInTheDocument();
  });

  it('carries the wa_chatbot_safety data attribute', () => {
    render(<WaRestNudge onDismiss={() => {}} />);
    const nudge = screen.getByTestId('wa-rest-nudge');
    expect(nudge).toHaveAttribute('data-wa-compliance', 'WA_HB_2822');
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<WaRestNudge onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss rest reminder/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

// ─── MinorSafeGate WA markers ────────────────────────────────────────────────

describe('MinorSafeGate WA compliance', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
      configurable: true,
      writable: true,
    });
  });

  it('shows the WA compliance marker text on the gate overlay', async () => {
    await act(async () => {
      render(
        <MinorSafeGate profile={{ age_verified: false }}>
          <div>Content</div>
        </MinorSafeGate>
      );
    });
    expect(screen.getByTestId('wa-compliance-marker')).toBeInTheDocument();
    expect(screen.getByText(/WA HB 2822 compliant/i)).toBeInTheDocument();
  });

  it('gate overlay carries data-wa-compliance attribute', async () => {
    await act(async () => {
      render(
        <MinorSafeGate profile={{ age_verified: false }}>
          <div>Content</div>
        </MinorSafeGate>
      );
    });
    const gate = screen.getByTestId('minor-safe-gate');
    expect(gate).toHaveAttribute('data-wa-compliance', 'WA_HB_2822');
  });
});

// ─── MinorSafeGate rest-nudge timer ──────────────────────────────────────────

describe('MinorSafeGate WA rest-nudge timer', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
      configurable: true,
      writable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows rest nudge immediately when chatStartedAt is ≥30 min ago', async () => {
    const thirtyOneMinutesAgo = Date.now() - WA_REST_NUDGE_THRESHOLD_MS - 1000;

    await act(async () => {
      render(
        <MinorSafeGate
          profile={{ age_verified: false }}
          chatStartedAt={thirtyOneMinutesAgo}
        >
          <div>Content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.getByTestId('wa-rest-nudge')).toBeInTheDocument();
  });

  it('does not show rest nudge immediately when chat started recently', async () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    await act(async () => {
      render(
        <MinorSafeGate
          profile={{ age_verified: false }}
          chatStartedAt={fiveMinutesAgo}
        >
          <div>Content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.queryByTestId('wa-rest-nudge')).not.toBeInTheDocument();
  });

  it('shows rest nudge after timer fires for remaining time', async () => {
    const twentyFiveMinutesAgo = Date.now() - 25 * 60 * 1000;

    await act(async () => {
      render(
        <MinorSafeGate
          profile={{ age_verified: false }}
          chatStartedAt={twentyFiveMinutesAgo}
        >
          <div>Content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.queryByTestId('wa-rest-nudge')).not.toBeInTheDocument();

    // Advance timers by the remaining 5 minutes
    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000 + 100);
    });

    expect(screen.getByTestId('wa-rest-nudge')).toBeInTheDocument();
  });

  it('does not show rest nudge for verified adult users', async () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 25);
    const thirtyOneMinutesAgo = Date.now() - WA_REST_NUDGE_THRESHOLD_MS - 1000;

    await act(async () => {
      render(
        <MinorSafeGate
          profile={{ age_verified: true, date_of_birth: dob.toISOString() }}
          chatStartedAt={thirtyOneMinutesAgo}
        >
          <div>Content</div>
        </MinorSafeGate>
      );
    });

    expect(screen.queryByTestId('wa-rest-nudge')).not.toBeInTheDocument();
  });
});
