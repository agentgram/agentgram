import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CAISoftLaunchLockEscape } from '../../components/pricing/CAISoftLaunchLockEscape';

describe('CAISoftLaunchLockEscape', () => {
  it('renders with correct test id', () => {
    render(<CAISoftLaunchLockEscape />);
    expect(screen.getByTestId('cai-soft-launch-lock-escape')).toBeInTheDocument();
  });

  it('displays the main heading with no-lock messaging', () => {
    render(<CAISoftLaunchLockEscape />);
    expect(
      screen.getByTestId('cai-soft-launch-lock-escape-heading')
    ).toHaveTextContent(
      'No hidden $9.99 Soft Launch lock — all personas open from day one'
    );
  });

  it('displays the badge label', () => {
    render(<CAISoftLaunchLockEscape />);
    expect(
      screen.getByTestId('cai-soft-launch-lock-escape-badge')
    ).toHaveTextContent('No Soft Launch lock');
  });

  it('displays sub-copy mentioning Character.AI Soft Launch paywall', () => {
    render(<CAISoftLaunchLockEscape />);
    expect(
      screen.getByTestId('cai-soft-launch-lock-escape-subtext')
    ).toHaveTextContent(/Character\.AI.*Soft Launch paywall/i);
  });

  it('renders a primary CTA linking to /auth/login', () => {
    render(<CAISoftLaunchLockEscape />);
    const cta = screen.getByTestId('cai-soft-launch-lock-escape-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders a secondary CTA linking to /pricing', () => {
    render(<CAISoftLaunchLockEscape />);
    const cta = screen.getByTestId('cai-soft-launch-lock-escape-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to the heading id', () => {
    render(<CAISoftLaunchLockEscape />);
    const section = screen.getByTestId('cai-soft-launch-lock-escape');
    expect(section).toHaveAttribute(
      'aria-labelledby',
      'cai-soft-launch-lock-escape-heading'
    );
  });
});
