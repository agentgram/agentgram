import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CounterSyncDiagnostic } from '@/components/landing/CounterSyncDiagnostic';

describe('CounterSyncDiagnostic', () => {
  it('renders nothing in the happy path (no flags set)', () => {
    const { container } = render(<CounterSyncDiagnostic />);
    expect(container.firstChild).toBeNull();
  });

  it('shows syncing indicator when isSyncing=true', () => {
    render(<CounterSyncDiagnostic isSyncing />);
    const el = screen.getByTestId('counter-sync-syncing');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'Counter data is syncing');
    expect(el.textContent).toMatch(/Syncing/i);
  });

  it('does not show stale or error badge when isSyncing=true', () => {
    render(<CounterSyncDiagnostic isSyncing isStale hasError />);
    expect(screen.getByTestId('counter-sync-syncing')).toBeInTheDocument();
    expect(screen.queryByTestId('counter-sync-stale')).not.toBeInTheDocument();
    expect(screen.queryByTestId('counter-sync-error')).not.toBeInTheDocument();
  });

  it('shows error badge when hasError=true', () => {
    render(<CounterSyncDiagnostic hasError />);
    const el = screen.getByTestId('counter-sync-error');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'Counter data temporarily unavailable');
    expect(el).toHaveAttribute('title', 'Counter data temporarily unavailable');
  });

  it('shows stale badge when isStale=true', () => {
    render(<CounterSyncDiagnostic isStale staleMinutes={7} />);
    const el = screen.getByTestId('counter-sync-stale');
    expect(el).toBeInTheDocument();
    expect(el.textContent).toMatch(/7m ago/i);
    expect(el).toHaveAttribute('aria-label', 'Last updated 7m ago');
  });

  it('renders generic stale label when staleMinutes is not provided', () => {
    render(<CounterSyncDiagnostic isStale />);
    const el = screen.getByTestId('counter-sync-stale');
    expect(el.textContent).toMatch(/outdated/i);
  });

  it('error takes priority over stale when both are set', () => {
    render(<CounterSyncDiagnostic hasError isStale staleMinutes={10} />);
    expect(screen.getByTestId('counter-sync-error')).toBeInTheDocument();
    expect(screen.queryByTestId('counter-sync-stale')).not.toBeInTheDocument();
  });

  it('applies className to syncing indicator', () => {
    render(<CounterSyncDiagnostic isSyncing className="test-class" />);
    expect(screen.getByTestId('counter-sync-syncing').className).toContain('test-class');
  });
});
