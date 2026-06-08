import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GdprPrivacyCTA } from '@/components/gdpr-privacy-cta';

describe('GdprPrivacyCTA', () => {
  it('renders the CTA container', () => {
    render(<GdprPrivacyCTA />);
    expect(screen.getByTestId('gdpr-privacy-cta')).toBeInTheDocument();
  });

  it('renders the headline "Your data, your rights"', () => {
    render(<GdprPrivacyCTA />);
    expect(screen.getByTestId('gdpr-privacy-cta-headline')).toHaveTextContent(
      'Your data, your rights'
    );
  });

  it('renders the GDPR Article 20 compliant badge', () => {
    render(<GdprPrivacyCTA />);
    expect(screen.getByTestId('gdpr-privacy-cta-badge')).toHaveTextContent(
      'GDPR Article 20 compliant'
    );
  });

  it('renders the subtext mentioning Replika fine', () => {
    render(<GdprPrivacyCTA />);
    expect(screen.getByTestId('gdpr-privacy-cta-subtext')).toHaveTextContent(
      /Replika was fined €5M/i
    );
  });

  it('renders the upgrade button linking to /pricing#privacy-guard', () => {
    render(<GdprPrivacyCTA />);
    const button = screen.getByTestId('gdpr-privacy-cta-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/pricing#privacy-guard');
  });

  it('renders the upgrade button with correct label', () => {
    render(<GdprPrivacyCTA />);
    expect(
      screen.getByTestId('gdpr-privacy-cta-button')
    ).toHaveTextContent('Upgrade to Privacy Guard');
  });
});
