import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SelfieEngineCounterBadge } from '../../components/agents/SelfieEngineCounterBadge';

describe('SelfieEngineCounterBadge', () => {
  it('renders with correct test id', () => {
    render(<SelfieEngineCounterBadge />);
    expect(screen.getByTestId('selfie-engine-counter-badge')).toBeInTheDocument();
  });

  it('displays "Consistent persona visuals" label', () => {
    render(<SelfieEngineCounterBadge />);
    expect(screen.getByTestId('selfie-engine-counter-label')).toHaveTextContent(
      'Consistent persona visuals'
    );
  });

  it('displays "Included free — no upgrade required" sublabel', () => {
    render(<SelfieEngineCounterBadge />);
    expect(screen.getByTestId('selfie-engine-counter-sublabel')).toHaveTextContent(
      'Included free — no upgrade required'
    );
  });

  it('applies additional className when provided', () => {
    render(<SelfieEngineCounterBadge className="mt-4" />);
    const badge = screen.getByTestId('selfie-engine-counter-badge');
    expect(badge).toHaveClass('mt-4');
  });
});
