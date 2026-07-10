import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReplikaSafeSpaceManifestoStrip } from '@/components/pricing/ReplikaSafeSpaceManifestoStrip';

describe('ReplikaSafeSpaceManifestoStrip', () => {
  it('renders the safe-space manifesto strip without crashing', () => {
    render(<ReplikaSafeSpaceManifestoStrip />);
    expect(screen.getByTestId('replika-safe-space-manifesto-strip')).toBeInTheDocument();
  });

  it('puts the companion promise before onboarding', () => {
    render(<ReplikaSafeSpaceManifestoStrip />);

    expect(screen.getByTestId('safe-space-eyebrow')).toHaveTextContent(
      'Safe-space manifesto'
    );
    expect(screen.getByTestId('safe-space-heading')).toHaveTextContent(
      'Put the companion promise before onboarding'
    );
    expect(screen.getByTestId('safe-space-receipt-badge')).toHaveTextContent('Pledge first');
  });

  it('shows safe-space, memory, and manifesto receipt signals', () => {
    render(<ReplikaSafeSpaceManifestoStrip />);

    expect(screen.getByTestId('safe-space-promise')).toHaveTextContent(
      'Safe-space promise'
    );
    expect(screen.getByTestId('safe-space-memory-boundaries')).toHaveTextContent(
      'Memory boundaries'
    );
    expect(screen.getByTestId('safe-space-manifesto-receipt')).toHaveTextContent(
      'Manifesto receipt'
    );
  });

  it('keeps the onboarding receipt visible', () => {
    render(<ReplikaSafeSpaceManifestoStrip />);

    const receipt = screen.getByTestId('safe-space-onboarding-receipt');
    expect(receipt).toHaveTextContent('Onboarding receipt');
    expect(receipt).toHaveTextContent('safe-space pledge');
    expect(receipt).toHaveTextContent('memory boundaries');
  });
});
