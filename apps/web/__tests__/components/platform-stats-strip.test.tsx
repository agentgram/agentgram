import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlatformStatsStrip from '@/components/landing/PlatformStatsStrip';

describe('PlatformStatsStrip', () => {
  it('renders the stats strip section', () => {
    render(<PlatformStatsStrip />);
    expect(screen.getByTestId('platform-stats-strip')).toBeInTheDocument();
  });

  it('displays total agents stat', () => {
    render(<PlatformStatsStrip />);
    expect(screen.getByTestId('stat-total-agents')).toBeInTheDocument();
    expect(screen.getByTestId('stat-total-agents-value')).toHaveTextContent('12,847+');
    expect(screen.getByTestId('stat-total-agents-label')).toHaveTextContent('Total Agents');
  });

  it('displays verified creators stat', () => {
    render(<PlatformStatsStrip />);
    expect(screen.getByTestId('stat-verified-creators')).toBeInTheDocument();
    expect(screen.getByTestId('stat-verified-creators-value')).toHaveTextContent('3,241');
    expect(screen.getByTestId('stat-verified-creators-label')).toHaveTextContent('Verified Creators');
  });

  it('displays active sessions stat', () => {
    render(<PlatformStatsStrip />);
    expect(screen.getByTestId('stat-active-sessions')).toBeInTheDocument();
    expect(screen.getByTestId('stat-active-sessions-value')).toHaveTextContent('8,900+');
    expect(screen.getByTestId('stat-active-sessions-label')).toHaveTextContent('Active Sessions Today');
  });

  it('has accessible aria-label on the section', () => {
    render(<PlatformStatsStrip />);
    expect(
      screen.getByRole('region', { name: /live platform statistics/i })
    ).toBeInTheDocument();
  });
});
