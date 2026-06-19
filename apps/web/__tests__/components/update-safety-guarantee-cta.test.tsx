import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UpdateSafetyGuaranteeCTA } from '@/components/update-safety-guarantee-cta';

describe('UpdateSafetyGuaranteeCTA', () => {
  it('renders the section heading', () => {
    render(<UpdateSafetyGuaranteeCTA />);
    expect(screen.getByTestId('update-safety-guarantee-cta')).toBeInTheDocument();
    expect(screen.getByTestId('update-safety-heading')).toHaveTextContent(
      "Update Safety — We've Got You Covered"
    );
  });

  it('renders all three guarantee bullets with correct links', () => {
    render(<UpdateSafetyGuaranteeCTA />);

    const memoryBullet = screen.getByTestId('update-safety-memory-bullet');
    expect(memoryBullet).toBeInTheDocument();
    expect(memoryBullet).toHaveTextContent(
      'Memory stability guaranteed — zero silent resets on updates'
    );
    expect(memoryBullet).toHaveAttribute('href', '/trust');

    const incidentsBullet = screen.getByTestId('update-safety-incidents-bullet');
    expect(incidentsBullet).toBeInTheDocument();
    expect(incidentsBullet).toHaveTextContent(
      'Live incident history — every update tracked at /trust/incidents'
    );
    expect(incidentsBullet).toHaveAttribute('href', '/trust/incidents');

    const alertsBullet = screen.getByTestId('update-safety-alerts-bullet');
    expect(alertsBullet).toBeInTheDocument();
    expect(alertsBullet).toHaveTextContent(
      'Real-time update health alerts — proactive notice before any change affects your experience'
    );
    expect(alertsBullet).toHaveAttribute('href', '/trust');
  });

  it('renders the premium CTA linking to /pricing#plans', () => {
    render(<UpdateSafetyGuaranteeCTA />);

    const cta = screen.getByTestId('update-safety-cta-button');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent('Get the Update Safety Guarantee');
    expect(cta).toHaveAttribute('href', '/pricing#plans');
  });

  it('renders the competitor comparison line mentioning Replika and C.AI', () => {
    render(<UpdateSafetyGuaranteeCTA />);

    const comparison = screen.getByTestId('update-safety-comparison');
    expect(comparison).toBeInTheDocument();
    expect(comparison).toHaveTextContent('Replika');
    expect(comparison).toHaveTextContent('memory resets on Pro→Ultra migration');
    expect(comparison).toHaveTextContent('C.AI');
    expect(comparison).toHaveTextContent('no incident transparency');
  });
});
