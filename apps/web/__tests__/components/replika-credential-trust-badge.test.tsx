import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ReplikaCredentialTrustBadge from '../../components/trust/ReplikaCredentialTrustBadge';

describe('ReplikaCredentialTrustBadge', () => {
  it('renders with correct test id', () => {
    render(<ReplikaCredentialTrustBadge />);
    expect(screen.getByTestId('replika-credential-trust-badge')).toBeInTheDocument();
  });

  it('displays the main heading with compliance copy', () => {
    render(<ReplikaCredentialTrustBadge />);
    expect(screen.getByTestId('replika-credential-trust-heading')).toHaveTextContent(
      'Real regulatory compliance. Verified team. No fake credentials.'
    );
  });

  it('displays the subtext mentioning Replika and Spotlight PA', () => {
    render(<ReplikaCredentialTrustBadge />);
    expect(screen.getByTestId('replika-credential-trust-subtext')).toHaveTextContent(
      /Replika/i
    );
    expect(screen.getByTestId('replika-credential-trust-subtext')).toHaveTextContent(
      /Spotlight PA/i
    );
  });

  it('displays the real regulatory compliance badge label', () => {
    render(<ReplikaCredentialTrustBadge />);
    expect(screen.getByTestId('replika-credential-trust-badge-label')).toHaveTextContent(
      'Real regulatory compliance'
    );
  });

  it('displays the verified team badge label', () => {
    render(<ReplikaCredentialTrustBadge />);
    expect(screen.getByTestId('replika-credential-verified-team-label')).toHaveTextContent(
      'Verified team'
    );
  });

  it('displays the no fake credentials badge label', () => {
    render(<ReplikaCredentialTrustBadge />);
    expect(screen.getByTestId('replika-credential-no-fake-label')).toHaveTextContent(
      'No fake credentials'
    );
  });

  it('renders three trust pillars', () => {
    render(<ReplikaCredentialTrustBadge />);
    const pillars = screen.getByTestId('replika-credential-trust-pillars');
    expect(pillars.children).toHaveLength(3);
  });

  it('renders primary CTA linking to /auth/login', () => {
    render(<ReplikaCredentialTrustBadge />);
    const cta = screen.getByTestId('replika-credential-trust-cta-primary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('renders secondary CTA linking to /pricing', () => {
    render(<ReplikaCredentialTrustBadge />);
    const cta = screen.getByTestId('replika-credential-trust-cta-secondary');
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('has aria-labelledby pointing to heading id', () => {
    render(<ReplikaCredentialTrustBadge />);
    const section = screen.getByTestId('replika-credential-trust-badge');
    expect(section).toHaveAttribute('aria-labelledby', 'replika-credential-trust-heading');
  });
});
