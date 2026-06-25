import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  MemoryHeadroomMeter,
  type MemoryHeadroomData,
} from '@/components/memory/MemoryHeadroomMeter';

function buildData(overrides: Partial<MemoryHeadroomData> = {}): MemoryHeadroomData {
  return {
    used: 40,
    capacity: 200,
    recentGains: [],
    ...overrides,
  };
}

describe('MemoryHeadroomMeter', () => {
  it('renders the meter container', () => {
    render(<MemoryHeadroomMeter data={buildData()} />);
    expect(screen.getByTestId('memory-headroom-meter')).toBeInTheDocument();
  });

  it('renders the progress bar', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 100, capacity: 200 })} />);
    const bar = screen.getByTestId('memory-headroom-bar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('role', 'progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });

  it('shows correct headroom percentage', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 50, capacity: 200 })} />);
    expect(screen.getByTestId('memory-headroom-pct')).toHaveTextContent('75% headroom');
  });

  it('shows remaining slots count', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 40, capacity: 200 })} />);
    expect(screen.getByTestId('memory-headroom-remaining')).toHaveTextContent('160 slots remaining');
  });

  it('shows used percentage label', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 40, capacity: 200 })} />);
    expect(screen.getByTestId('memory-headroom-used-pct')).toHaveTextContent('20% full');
  });

  it('does not show warning badge in normal state (< 80%)', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 100, capacity: 200 })} />);
    expect(screen.queryByTestId('memory-headroom-warning')).not.toBeInTheDocument();
  });

  it('shows warning badge when usage is high (>= 80%)', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 170, capacity: 200 })} />);
    expect(screen.getByTestId('memory-headroom-warning')).toBeInTheDocument();
    expect(screen.getByTestId('memory-headroom-warning')).toHaveTextContent(/high usage/i);
  });

  it('shows critical badge when usage is >= 95%', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 195, capacity: 200 })} />);
    const warning = screen.getByTestId('memory-headroom-warning');
    expect(warning).toHaveTextContent(/critical/i);
  });

  it('renders retention gains when provided', () => {
    const data = buildData({
      recentGains: [{ label: 'facts retained', count: 5, period: 'this week' }],
    });
    render(<MemoryHeadroomMeter data={data} />);
    expect(screen.getByTestId('memory-headroom-gains')).toBeInTheDocument();
    expect(screen.getByTestId('memory-headroom-gain-0')).toHaveTextContent('+5 facts retained this week');
  });

  it('renders multiple retention gains', () => {
    const data = buildData({
      recentGains: [
        { label: 'facts retained', count: 3, period: 'this week' },
        { label: 'topics added', count: 2, period: 'today' },
      ],
    });
    render(<MemoryHeadroomMeter data={data} />);
    expect(screen.getByTestId('memory-headroom-gain-0')).toHaveTextContent('+3');
    expect(screen.getByTestId('memory-headroom-gain-1')).toHaveTextContent('+2');
  });

  it('does not render gains section when recentGains is empty', () => {
    render(<MemoryHeadroomMeter data={buildData({ recentGains: [] })} />);
    expect(screen.queryByTestId('memory-headroom-gains')).not.toBeInTheDocument();
  });

  it('shows used/capacity in the bar section label', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 40, capacity: 200 })} />);
    expect(screen.getByTestId('memory-headroom-bar-section')).toHaveTextContent('40 / 200 facts used');
  });

  it('clamps bar fill to 100% when used exceeds capacity', () => {
    render(<MemoryHeadroomMeter data={buildData({ used: 250, capacity: 200 })} />);
    const fill = screen.getByTestId('memory-headroom-bar-fill');
    expect(fill).toHaveStyle({ width: '100%' });
  });
});
