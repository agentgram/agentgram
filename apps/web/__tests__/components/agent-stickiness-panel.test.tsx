import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgentStickinessPanel } from '@/components/dashboard/AgentStickinessPanel';
import type { AgentStickinessData } from '@/components/dashboard/AgentStickinessPanel';

function buildHeatmap(days = 28, sessions = 0) {
  const today = new Date('2026-06-10');
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return { date: d.toISOString().slice(0, 10), sessions };
  });
}

function buildData(overrides: Partial<AgentStickinessData> = {}): AgentStickinessData {
  return {
    dailyActiveVisitors: 42,
    continuityScore: 75,
    heatmap: buildHeatmap(),
    ...overrides,
  };
}

describe('AgentStickinessPanel', () => {
  it('renders the panel container', () => {
    render(<AgentStickinessPanel data={buildData()} />);
    expect(screen.getByTestId('agent-stickiness-panel')).toBeInTheDocument();
  });

  it('displays the daily active visitor count', () => {
    render(<AgentStickinessPanel data={buildData({ dailyActiveVisitors: 123 })} />);
    const dav = screen.getByTestId('daily-active-visitors');
    expect(dav).toHaveTextContent('123');
  });

  it('displays the continuity score', () => {
    render(<AgentStickinessPanel data={buildData({ continuityScore: 82 })} />);
    const score = screen.getByTestId('continuity-score');
    expect(score).toHaveTextContent('82');
  });

  it('renders the heatmap grid', () => {
    render(<AgentStickinessPanel data={buildData()} />);
    expect(screen.getByTestId('stickiness-heatmap')).toBeInTheDocument();
  });

  it('heatmap renders 28 cells', () => {
    render(<AgentStickinessPanel data={buildData()} />);
    const grid = screen.getByTestId('stickiness-heatmap');
    // Each cell has an aria-label
    expect(grid.querySelectorAll('[aria-label]').length).toBe(28);
  });

  it('shows zero visitors as 0', () => {
    render(<AgentStickinessPanel data={buildData({ dailyActiveVisitors: 0 })} />);
    expect(screen.getByTestId('daily-active-visitors')).toHaveTextContent('0');
  });

  it('clamps continuity score above 100 to 100', () => {
    render(<AgentStickinessPanel data={buildData({ continuityScore: 150 })} />);
    expect(screen.getByTestId('continuity-score')).toHaveTextContent('100');
  });

  it('clamps continuity score below 0 to 0', () => {
    render(<AgentStickinessPanel data={buildData({ continuityScore: -5 })} />);
    expect(screen.getByTestId('continuity-score')).toHaveTextContent('0');
  });

  it('renders the panel title text', () => {
    render(<AgentStickinessPanel data={buildData()} />);
    expect(screen.getByText(/agent stickiness/i)).toBeInTheDocument();
  });

  it('renders "Today" badge for daily active visitors', () => {
    render(<AgentStickinessPanel data={buildData()} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });
});
