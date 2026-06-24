import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryArchitectureDiagram } from '../../../components/memory/MemoryArchitectureDiagram';

describe('MemoryArchitectureDiagram', () => {
  it('renders the root container', () => {
    render(<MemoryArchitectureDiagram />);
    expect(screen.getByTestId('memory-architecture-diagram')).toBeInTheDocument();
  });

  it('renders all 5 memory layers', () => {
    render(<MemoryArchitectureDiagram />);
    const layers = [
      'memory-layer-session-context',
      'memory-layer-short-term',
      'memory-layer-long-term',
      'memory-layer-identity-core',
      'memory-layer-context-layer',
    ];
    for (const testId of layers) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  });

  it('shows correct sublabels Layer 1 through Layer 5', () => {
    render(<MemoryArchitectureDiagram />);
    for (let i = 1; i <= 5; i++) {
      const sublabels = screen.getAllByText(`Layer ${i}`);
      expect(sublabels.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders Session Context layer with correct label', () => {
    render(<MemoryArchitectureDiagram />);
    expect(
      screen.getByTestId('memory-layer-label-session-context')
    ).toHaveTextContent('Session Context');
  });

  it('renders Short-term Memory layer with correct label', () => {
    render(<MemoryArchitectureDiagram />);
    expect(
      screen.getByTestId('memory-layer-label-short-term')
    ).toHaveTextContent('Short-term Memory');
  });

  it('renders Long-term Memory layer with correct label', () => {
    render(<MemoryArchitectureDiagram />);
    expect(
      screen.getByTestId('memory-layer-label-long-term')
    ).toHaveTextContent('Long-term Memory');
  });

  it('renders Identity Core layer with correct label', () => {
    render(<MemoryArchitectureDiagram />);
    expect(
      screen.getByTestId('memory-layer-label-identity-core')
    ).toHaveTextContent('Identity Core');
  });

  it('renders Context Layer with correct label', () => {
    render(<MemoryArchitectureDiagram />);
    expect(
      screen.getByTestId('memory-layer-label-context-layer')
    ).toHaveTextContent('Context Layer');
  });

  it('renders long-term description mentioning GDPR Art.17', () => {
    render(<MemoryArchitectureDiagram />);
    const desc = screen.getByTestId('memory-layer-desc-long-term');
    expect(desc.textContent).toMatch(/GDPR Art\.17/);
  });

  it('renders the full-stack memory transparency footer', () => {
    render(<MemoryArchitectureDiagram />);
    expect(screen.getByTestId('memory-architecture-footer')).toBeInTheDocument();
  });

  it('footer claim reads "Full-stack memory transparency"', () => {
    render(<MemoryArchitectureDiagram />);
    expect(
      screen.getByTestId('memory-architecture-footer-claim')
    ).toHaveTextContent('Full-stack memory transparency');
  });

  it('renders GDPR deletion receipts link pointing to /dashboard/memory-export', () => {
    render(<MemoryArchitectureDiagram />);
    const link = screen.getByTestId('memory-architecture-gdpr-link');
    expect(link).toHaveAttribute('href', '/dashboard/memory-export');
    expect(link.textContent).toMatch(/GDPR deletion receipts/);
  });

  it('has correct aria-label on root container', () => {
    render(<MemoryArchitectureDiagram />);
    expect(screen.getByTestId('memory-architecture-diagram')).toHaveAttribute(
      'aria-label',
      'AgentGram 5-layer memory architecture'
    );
  });

  it('renders connector elements between layers (4 connectors for 5 layers)', () => {
    render(<MemoryArchitectureDiagram />);
    const connectors = [
      'memory-layer-connector-session-context',
      'memory-layer-connector-short-term',
      'memory-layer-connector-long-term',
      'memory-layer-connector-identity-core',
    ];
    for (const testId of connectors) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
    // Last layer (context-layer) has no connector
    expect(
      screen.queryByTestId('memory-layer-connector-context-layer')
    ).not.toBeInTheDocument();
  });
});
