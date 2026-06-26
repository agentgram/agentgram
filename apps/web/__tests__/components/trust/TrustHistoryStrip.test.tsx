/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TrustHistoryStrip, {
  type TrustHistoryStripProps,
} from '@/components/home/TrustHistoryStrip';

const BASE_PROPS: TrustHistoryStripProps = {
  verifiedCount: 2847,
  verifiedCountDelta: 34,
  lastSync: '2h ago',
  lastSyncIso: '2026-06-26T10:00:00.000Z',
  feedFreshness: 'fresh',
};

describe('TrustHistoryStrip', () => {
  it('renders the strip container', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} />);
    expect(screen.getByTestId('trust-history-strip')).toBeInTheDocument();
  });

  it('displays the verified count formatted with locale separators', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} verifiedCount={2847} />);
    const countEl = screen.getByTestId('trust-history-verified-count');
    expect(countEl).toHaveTextContent('2,847');
    expect(countEl).toHaveTextContent('verified');
  });

  it('renders a positive delta badge with "+" prefix', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} verifiedCountDelta={34} />);
    const badge = screen.getByTestId('trust-history-delta-badge');
    expect(badge).toHaveTextContent('+34');
  });

  it('renders a negative delta badge without "+" prefix', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} verifiedCountDelta={-5} />);
    const badge = screen.getByTestId('trust-history-delta-badge');
    expect(badge).toHaveTextContent('-5');
    expect(badge).not.toHaveTextContent('+-5');
  });

  it('omits the delta badge when verifiedCountDelta is zero', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} verifiedCountDelta={0} />);
    expect(
      screen.queryByTestId('trust-history-delta-badge')
    ).not.toBeInTheDocument();
  });

  it('shows the lastSync label inside the last-sync element', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} lastSync="2h ago" />);
    const syncEl = screen.getByTestId('trust-history-last-sync');
    expect(syncEl).toHaveTextContent('Last sync:');
    expect(syncEl).toHaveTextContent('2h ago');
  });

  it('uses lastSyncIso as the <time> dateTime attribute when provided', () => {
    render(
      <TrustHistoryStrip
        {...BASE_PROPS}
        lastSyncIso="2026-06-26T10:00:00.000Z"
      />
    );
    const timeEl = screen
      .getByTestId('trust-history-last-sync')
      .querySelector('time');
    expect(timeEl).toHaveAttribute('dateTime', '2026-06-26T10:00:00.000Z');
  });

  it('shows "Live" label for fresh feed freshness', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} feedFreshness="fresh" />);
    expect(screen.getByTestId('trust-history-freshness-label')).toHaveTextContent(
      'Live'
    );
  });

  it('shows "Stale" label for stale feed freshness', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} feedFreshness="stale" />);
    expect(screen.getByTestId('trust-history-freshness-label')).toHaveTextContent(
      'Stale'
    );
  });

  it('shows "Unknown" label for unknown feed freshness', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} feedFreshness="unknown" />);
    expect(screen.getByTestId('trust-history-freshness-label')).toHaveTextContent(
      'Unknown'
    );
  });

  it('renders the freshness indicator container', () => {
    render(<TrustHistoryStrip {...BASE_PROPS} />);
    expect(screen.getByTestId('trust-history-freshness')).toBeInTheDocument();
  });
});
