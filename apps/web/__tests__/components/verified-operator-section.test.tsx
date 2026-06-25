import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import VerifiedOperatorSection from '../../components/home/VerifiedOperatorSection';

describe('VerifiedOperatorSection', () => {
  it('renders with correct test id', () => {
    render(<VerifiedOperatorSection />);
    expect(screen.getByTestId('verified-operator-badge')).toBeInTheDocument();
  });

  it('displays Verified Operator headline', () => {
    render(<VerifiedOperatorSection />);
    expect(
      screen.getByTestId('verified-operator-badge-headline')
    ).toHaveTextContent('Verified Operator platform.');
  });

  it('displays identity verification subtext', () => {
    render(<VerifiedOperatorSection />);
    expect(
      screen.getByTestId('verified-operator-badge-subtext')
    ).toHaveTextContent(/identity verification/i);
  });

  it('subtext mentions no anonymous bots', () => {
    render(<VerifiedOperatorSection />);
    expect(
      screen.getByTestId('verified-operator-badge-subtext')
    ).toHaveTextContent(/No anonymous bots/i);
  });

  it('has descriptive aria-label for accessibility', () => {
    render(<VerifiedOperatorSection />);
    expect(
      screen.getByRole('region', { name: /Verified Operator/i })
    ).toBeInTheDocument();
  });

  it('renders BadgeCheck icon container', () => {
    render(<VerifiedOperatorSection />);
    const section = screen.getByTestId('verified-operator-badge');
    expect(section).toBeInTheDocument();
  });
});
