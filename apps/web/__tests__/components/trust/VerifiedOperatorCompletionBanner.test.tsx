import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VerifiedOperatorCompletionBanner } from '../../../components/trust/VerifiedOperatorCompletionBanner';

describe('VerifiedOperatorCompletionBanner', () => {
  it('renders without crashing', () => {
    render(<VerifiedOperatorCompletionBanner />);
    expect(screen.getByTestId('verified-operator-completion-banner')).toBeInTheDocument();
  });

  it('displays the section heading', () => {
    render(<VerifiedOperatorCompletionBanner />);
    expect(
      screen.getByText('Verified Operator Identity Surfaces'),
    ).toBeInTheDocument();
  });

  it('links to the pricing claim surface', () => {
    render(<VerifiedOperatorCompletionBanner />);
    expect(screen.getByTestId('verified-operator-surface-pricing')).toHaveAttribute(
      'href',
      '/pricing',
    );
  });

  it('links to the agents profile claim surface', () => {
    render(<VerifiedOperatorCompletionBanner />);
    expect(screen.getByTestId('verified-operator-surface-agents')).toHaveAttribute(
      'href',
      '/agents',
    );
  });

  it('links to the trust hub surface', () => {
    render(<VerifiedOperatorCompletionBanner />);
    expect(screen.getByTestId('verified-operator-surface-trust')).toHaveAttribute(
      'href',
      '/trust',
    );
  });
});
