import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MultiStateComplianceBadge } from '../../components/multi-state-compliance-badge';

describe('MultiStateComplianceBadge — card variant (default)', () => {
  it('renders the card with correct test id', () => {
    render(<MultiStateComplianceBadge />);
    expect(
      screen.getByTestId('multi-state-compliance-card')
    ).toBeInTheDocument();
  });

  it('displays the "AI Safety Compliant" header', () => {
    render(<MultiStateComplianceBadge />);
    expect(screen.getByText(/AI Safety Compliant/i)).toBeInTheDocument();
  });

  it('displays the headline copy mentioning CA, NY, WA', () => {
    render(<MultiStateComplianceBadge />);
    expect(
      screen.getByText(/Compliant in CA, NY, WA and counting/i)
    ).toBeInTheDocument();
  });

  it('shows the CA SB 243 state badge', () => {
    render(<MultiStateComplianceBadge />);
    expect(screen.getByText('CA SB 243')).toBeInTheDocument();
  });

  it('shows the NY AI Companion Law state badge', () => {
    render(<MultiStateComplianceBadge />);
    expect(screen.getByText('NY AI Companion Law')).toBeInTheDocument();
  });

  it('shows the WA HB 2822 state badge', () => {
    render(<MultiStateComplianceBadge />);
    expect(screen.getByText('WA HB 2822')).toBeInTheDocument();
  });

  it('shows "+24 states monitored" badge', () => {
    render(<MultiStateComplianceBadge />);
    expect(screen.getByText('+24 states monitored')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<MultiStateComplianceBadge />);
    expect(
      screen.getByLabelText('Multi-state AI compliance readiness')
    ).toBeInTheDocument();
  });

  it('renders a link to /about', () => {
    render(<MultiStateComplianceBadge />);
    const link = screen.getByRole('link', { name: /View compliance details/i });
    expect(link).toHaveAttribute('href', '/about');
  });

  it('does not render the strip test id in card mode', () => {
    render(<MultiStateComplianceBadge />);
    expect(
      screen.queryByTestId('multi-state-compliance-strip')
    ).not.toBeInTheDocument();
  });
});

describe('MultiStateComplianceBadge — strip variant', () => {
  it('renders the strip with correct test id', () => {
    render(<MultiStateComplianceBadge variant="strip" />);
    expect(
      screen.getByTestId('multi-state-compliance-strip')
    ).toBeInTheDocument();
  });

  it('displays the AI Safety Compliant label', () => {
    render(<MultiStateComplianceBadge variant="strip" />);
    expect(screen.getByText(/AI Safety Compliant/i)).toBeInTheDocument();
  });

  it('mentions CA, NY, WA compliance in the copy', () => {
    render(<MultiStateComplianceBadge variant="strip" />);
    expect(screen.getByText(/Compliant in CA, NY, WA and counting/i)).toBeInTheDocument();
  });

  it('has the correct aria-label for accessibility', () => {
    render(<MultiStateComplianceBadge variant="strip" />);
    expect(
      screen.getByLabelText('Multi-state AI compliance readiness')
    ).toBeInTheDocument();
  });

  it('renders a Learn more link to /about', () => {
    render(<MultiStateComplianceBadge variant="strip" />);
    const link = screen.getByRole('link', { name: /Learn more/i });
    expect(link).toHaveAttribute('href', '/about');
  });

  it('does not render the card test id in strip mode', () => {
    render(<MultiStateComplianceBadge variant="strip" />);
    expect(
      screen.queryByTestId('multi-state-compliance-card')
    ).not.toBeInTheDocument();
  });
});
