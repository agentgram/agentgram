import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ControlSurfacePaidFunnelSection } from '@/components/pricing/ControlSurfacePaidFunnelSection';

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          delete (props as Record<string, unknown>).initial;
          delete (props as Record<string, unknown>).animate;
          delete (props as Record<string, unknown>).transition;
          delete (props as Record<string, unknown>).whileInView;
          delete (props as Record<string, unknown>).viewport;
          return React.createElement(tag, props, children);
        };
      },
    }
  ),
}));

describe('ControlSurfacePaidFunnelSection', () => {
  it('renders the section without crashing', () => {
    render(<ControlSurfacePaidFunnelSection />);
    expect(
      screen.getByTestId('control-surface-paid-funnel-section')
    ).toBeInTheDocument();
  });

  it('displays the "Transparent Control" heading', () => {
    render(<ControlSurfacePaidFunnelSection />);
    expect(screen.getByTestId('control-surface-heading').textContent).toMatch(
      /You control every conversation/i
    );
  });

  it('renders all three pillars', () => {
    render(<ControlSurfacePaidFunnelSection />);
    expect(screen.getByTestId('control-pillar-reply-quality')).toBeInTheDocument();
    expect(screen.getByTestId('control-pillar-provenance')).toBeInTheDocument();
    expect(screen.getByTestId('control-pillar-no-gating')).toBeInTheDocument();
  });

  it('pillar grid renders three items', () => {
    render(<ControlSurfacePaidFunnelSection />);
    const pillars = screen.getByTestId('control-surface-pillars');
    expect(pillars.children).toHaveLength(3);
  });

  it('embeds ReplicaUltraFeatureDeltaCard', () => {
    render(<ControlSurfacePaidFunnelSection />);
    expect(
      screen.getByTestId('control-surface-replica-delta-wrapper')
    ).toBeInTheDocument();
    expect(screen.getByTestId('replica-ultra-feature-delta-card')).toBeInTheDocument();
  });

  it('embeds MoltbookProvenanceTooltip demo wrapper', () => {
    render(<ControlSurfacePaidFunnelSection />);
    expect(
      screen.getByTestId('control-surface-provenance-wrapper')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('control-surface-provenance-tooltip-demo')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('moltbook-provenance-tooltip-root')
    ).toBeInTheDocument();
  });

  it('section has correct aria-labelledby', () => {
    render(<ControlSurfacePaidFunnelSection />);
    const section = screen.getByTestId('control-surface-paid-funnel-section');
    expect(section).toHaveAttribute('aria-labelledby', 'control-surface-heading');
  });

  it('mentions competitor counter-narrative in intro text', () => {
    render(<ControlSurfacePaidFunnelSection />);
    const section = screen.getByTestId('control-surface-paid-funnel-section');
    expect(section.textContent).toMatch(/upgrade ladders/i);
  });
});
