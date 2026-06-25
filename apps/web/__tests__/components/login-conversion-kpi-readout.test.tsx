import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginConversionKpiReadout } from '@/components/LoginConversionKpiReadout';

describe('LoginConversionKpiReadout', () => {
  it('renders the KPI readout container', () => {
    render(<LoginConversionKpiReadout />);
    expect(
      screen.getByTestId('login-conversion-kpi-readout')
    ).toBeInTheDocument();
  });

  it('renders the paid onboarding badge', () => {
    render(<LoginConversionKpiReadout />);
    expect(screen.getByText('Paid onboarding')).toBeInTheDocument();
  });

  it('renders the heading', () => {
    render(<LoginConversionKpiReadout />);
    expect(
      screen.getByText('What your login unlocks with Pro')
    ).toBeInTheDocument();
  });

  it('renders the KPI table', () => {
    render(<LoginConversionKpiReadout />);
    expect(screen.getByTestId('login-kpi-table')).toBeInTheDocument();
  });

  it('renders all three KPI rows', () => {
    render(<LoginConversionKpiReadout />);
    const rows = screen.getAllByTestId('login-kpi-row');
    expect(rows).toHaveLength(3);
  });

  it('renders API requests KPI with free and pro values', () => {
    render(<LoginConversionKpiReadout />);
    expect(screen.getByText('API requests / day')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
  });

  it('renders simulations KPI', () => {
    render(<LoginConversionKpiReadout />);
    expect(screen.getByText('Simulations / month')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders AX scans KPI', () => {
    render(<LoginConversionKpiReadout />);
    expect(screen.getByText('AX scans / month')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders the pricing CTA link', () => {
    render(<LoginConversionKpiReadout />);
    const cta = screen.getByTestId('login-conversion-cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/pricing');
    expect(screen.getByText('See full paid onboarding')).toBeInTheDocument();
  });
});
