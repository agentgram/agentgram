import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NomiControlSurfaceComparison } from '../../../components/trust/NomiControlSurfaceComparison';

describe('NomiControlSurfaceComparison', () => {
  it('renders without crashing', () => {
    render(<NomiControlSurfaceComparison />);
    expect(screen.getByTestId('nomi-control-surface-comparison')).toBeInTheDocument();
  });

  it('displays the section heading referencing Nomi features', () => {
    render(<NomiControlSurfaceComparison />);
    const heading = screen.getByTestId('nomi-comparison-heading');
    expect(heading.textContent).toMatch(/Nomi/);
    expect(heading.textContent).toMatch(/V5/);
    expect(heading.textContent).toMatch(/V3/);
    expect(heading.textContent).toMatch(/Mind Map/);
  });

  it('renders all three capability blocks', () => {
    render(<NomiControlSurfaceComparison />);
    expect(screen.getByTestId('nomi-block-image')).toBeInTheDocument();
    expect(screen.getByTestId('nomi-block-voice')).toBeInTheDocument();
    expect(screen.getByTestId('nomi-block-memory')).toBeInTheDocument();
  });

  it('image block CTA links to /pricing', () => {
    render(<NomiControlSurfaceComparison />);
    const cta = screen.getByTestId('nomi-block-image-cta');
    expect(cta).toHaveAttribute('href', '/pricing');
  });

  it('memory block CTA links to /trust with anchor', () => {
    render(<NomiControlSurfaceComparison />);
    const cta = screen.getByTestId('nomi-block-memory-cta');
    expect(cta).toHaveAttribute('href', '/trust#memory-architecture');
  });

  it('voice block references no paywall', () => {
    render(<NomiControlSurfaceComparison />);
    const block = screen.getByTestId('nomi-block-voice');
    expect(block.textContent).toMatch(/paywall/i);
  });

  it('memory block references PR #854', () => {
    render(<NomiControlSurfaceComparison />);
    const block = screen.getByTestId('nomi-block-memory');
    expect(block.textContent).toMatch(/#854/);
  });

  it('bottom CTA primary link goes to /auth/login', () => {
    render(<NomiControlSurfaceComparison />);
    const cta = screen.getByTestId('nomi-comparison-cta-primary');
    expect(cta).toHaveAttribute('href', '/auth/login');
  });

  it('bottom CTA pricing link goes to /pricing', () => {
    render(<NomiControlSurfaceComparison />);
    const cta = screen.getByTestId('nomi-comparison-cta-pricing');
    expect(cta).toHaveAttribute('href', '/pricing');
  });

  it('section is accessible with aria-labelledby', () => {
    render(<NomiControlSurfaceComparison />);
    const section = screen.getByTestId('nomi-control-surface-comparison');
    expect(section).toHaveAttribute('aria-labelledby', 'nomi-comparison-heading');
    expect(screen.getByRole('heading', { name: /Nomi V5 images/i })).toBeInTheDocument();
  });
});
