import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryIntegritySLACounter } from '../../components/ui/MemoryIntegritySLACounter';

describe('MemoryIntegritySLACounter', () => {
  it('renders without crashing', () => {
    render(<MemoryIntegritySLACounter />);
    expect(screen.getByTestId('memory-integrity-sla-counter')).toBeInTheDocument();
  });

  it('displays "days" text', () => {
    render(<MemoryIntegritySLACounter />);
    expect(screen.getByTestId('memory-sla-days-label')).toHaveTextContent('days');
  });

  it('displays "memory incident-free" heading', () => {
    render(<MemoryIntegritySLACounter />);
    expect(screen.getByTestId('memory-sla-incident-free-label')).toHaveTextContent(
      'memory incident-free'
    );
  });

  it('shows Kindroid incident reference note', () => {
    render(<MemoryIntegritySLACounter />);
    expect(screen.getByTestId('memory-sla-kindroid-note')).toHaveTextContent(
      'Kindroid Feb 2026 drift'
    );
  });

  it('renders a positive day count when given a past date', () => {
    render(<MemoryIntegritySLACounter incidentFreeStartDate="2020-01-01" />);
    const count = parseInt(
      screen.getByTestId('memory-sla-days-count').textContent ?? '0',
      10
    );
    expect(count).toBeGreaterThan(0);
  });

  it('renders the uptime badge', () => {
    render(<MemoryIntegritySLACounter />);
    expect(screen.getByTestId('memory-sla-badge')).toBeInTheDocument();
  });

  it('uses a custom incidentFreeStartDate prop when provided', () => {
    render(<MemoryIntegritySLACounter incidentFreeStartDate="2025-01-01" />);
    const count = parseInt(
      screen.getByTestId('memory-sla-days-count').textContent ?? '0',
      10
    );
    // Jan 1, 2025 is at least 500 days before mid-2026
    expect(count).toBeGreaterThan(100);
  });
});
