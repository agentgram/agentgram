import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  MemoryUsageMeter,
  type MemoryUsageData,
} from '@/components/memory/MemoryUsageMeter';

function buildData(overrides: Partial<MemoryUsageData> = {}): MemoryUsageData {
  return {
    storyMemory: { count: 20, limit: 100, pct: 20 },
    facts: { count: 10, limit: 50, pct: 20 },
    overall: { count: 30, limit: 150, pct: 20 },
    ...overrides,
  };
}

describe('MemoryUsageMeter', () => {
  describe('full variant', () => {
    it('renders the full meter container', () => {
      render(<MemoryUsageMeter data={buildData()} />);
      expect(screen.getByTestId('memory-usage-meter-full')).toBeInTheDocument();
    });

    it('renders all three metric rows', () => {
      render(<MemoryUsageMeter data={buildData()} />);
      expect(screen.getByTestId('memory-meter-story-row')).toBeInTheDocument();
      expect(screen.getByTestId('memory-meter-facts-row')).toBeInTheDocument();
      expect(screen.getByTestId('memory-meter-overall-row')).toBeInTheDocument();
    });

    it('displays Story Memory count and limit', () => {
      render(<MemoryUsageMeter data={buildData({ storyMemory: { count: 45, limit: 100, pct: 45 } })} />);
      expect(screen.getByTestId('memory-meter-story-row')).toHaveTextContent('45 / 100');
    });

    it('displays Facts count and limit', () => {
      render(<MemoryUsageMeter data={buildData({ facts: { count: 30, limit: 50, pct: 60 } })} />);
      expect(screen.getByTestId('memory-meter-facts-row')).toHaveTextContent('30 / 50');
    });

    it('displays overall usage percentage', () => {
      render(<MemoryUsageMeter data={buildData({ overall: { count: 75, limit: 150, pct: 50 } })} />);
      expect(screen.getByTestId('memory-meter-overall-row')).toHaveTextContent('50%');
    });

    it('renders progress bars with correct aria attributes', () => {
      render(<MemoryUsageMeter data={buildData({ storyMemory: { count: 60, limit: 100, pct: 60 } })} />);
      const bar = screen.getByTestId('memory-meter-story-bar');
      expect(bar).toHaveAttribute('role', 'progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '60');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('applies destructive color class at ≥95% saturation', () => {
      render(<MemoryUsageMeter data={buildData({ storyMemory: { count: 95, limit: 100, pct: 95 } })} />);
      const bar = screen.getByTestId('memory-meter-story-bar');
      expect(bar.firstChild).toHaveClass('bg-destructive');
    });

    it('applies warning color class at ≥80% saturation', () => {
      render(<MemoryUsageMeter data={buildData({ facts: { count: 40, limit: 50, pct: 80 } })} />);
      const bar = screen.getByTestId('memory-meter-facts-bar');
      expect(bar.firstChild).toHaveClass('bg-amber-500');
    });

    it('applies normal color class below 80% saturation', () => {
      render(<MemoryUsageMeter data={buildData({ overall: { count: 50, limit: 150, pct: 33 } })} />);
      const bar = screen.getByTestId('memory-meter-overall-bar');
      expect(bar.firstChild).toHaveClass('bg-violet-500');
    });
  });

  describe('compact variant', () => {
    it('renders the compact meter container', () => {
      render(<MemoryUsageMeter data={buildData()} variant="compact" />);
      expect(screen.getByTestId('memory-usage-meter-compact')).toBeInTheDocument();
    });

    it('renders all three compact sections', () => {
      render(<MemoryUsageMeter data={buildData()} variant="compact" />);
      expect(screen.getByTestId('memory-meter-story-compact')).toBeInTheDocument();
      expect(screen.getByTestId('memory-meter-facts-compact')).toBeInTheDocument();
      expect(screen.getByTestId('memory-meter-overall-compact')).toBeInTheDocument();
    });

    it('shows story memory percentage in compact mode', () => {
      render(
        <MemoryUsageMeter
          data={buildData({ storyMemory: { count: 23, limit: 100, pct: 23 } })}
          variant="compact"
        />
      );
      expect(screen.getByTestId('memory-meter-story-compact')).toHaveTextContent('23%');
    });

    it('shows facts count / limit in compact mode', () => {
      render(
        <MemoryUsageMeter
          data={buildData({ facts: { count: 12, limit: 50, pct: 24 } })}
          variant="compact"
        />
      );
      expect(screen.getByTestId('memory-meter-facts-compact')).toHaveTextContent('12/50');
    });

    it('shows overall usage percentage in compact mode', () => {
      render(
        <MemoryUsageMeter
          data={buildData({ overall: { count: 35, limit: 150, pct: 23 } })}
          variant="compact"
        />
      );
      expect(screen.getByTestId('memory-meter-overall-compact')).toHaveTextContent('23%');
    });

    it('has an accessible aria-label', () => {
      render(<MemoryUsageMeter data={buildData()} variant="compact" />);
      expect(screen.getByTestId('memory-usage-meter-compact')).toHaveAttribute(
        'aria-label',
        'Memory usage summary'
      );
    });
  });
});
