import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ViralSafetyMemoryPaidFunnel } from '../../components/ViralSafetyMemoryPaidFunnel';

describe('ViralSafetyMemoryPaidFunnel', () => {
  it('renders without crashing', () => {
    render(<ViralSafetyMemoryPaidFunnel />);
    expect(
      screen.getByTestId('viral-safety-memory-paid-funnel')
    ).toBeInTheDocument();
  });

  it('contains group chat text', () => {
    render(<ViralSafetyMemoryPaidFunnel />);
    expect(
      screen.getByText(/invite friends to group chats/i)
    ).toBeInTheDocument();
  });

  it('contains Memory Integrity text', () => {
    render(<ViralSafetyMemoryPaidFunnel />);
    expect(
      screen.getByText(/guaranteed memory across every session/i)
    ).toBeInTheDocument();
  });

  it('contains a link to /safety', () => {
    render(<ViralSafetyMemoryPaidFunnel />);
    const safetyLink = screen.getByTestId('viral-funnel-safety-link');
    expect(safetyLink).toHaveAttribute('href', '/safety');
  });

  it('contains upgrade CTA text', () => {
    render(<ViralSafetyMemoryPaidFunnel />);
    expect(
      screen.getByTestId('viral-funnel-upgrade-cta')
    ).toBeInTheDocument();
    expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
  });

  it('upgrade CTA links to /pricing?plan=pro', () => {
    render(<ViralSafetyMemoryPaidFunnel />);
    const cta = screen.getByTestId('viral-funnel-upgrade-cta');
    expect(cta).toHaveAttribute('href', '/pricing');
  });
});
