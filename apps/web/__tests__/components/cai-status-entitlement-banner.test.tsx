import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CAIStatusEntitlementBanner } from '../../components/pricing/CAIStatusEntitlementBanner';

describe('CAIStatusEntitlementBanner', () => {
  it('renders with the expected test id and accessible heading', () => {
    render(<CAIStatusEntitlementBanner />);

    const banner = screen.getByTestId('cai-status-entitlement-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute(
      'aria-labelledby',
      'cai-status-entitlement-banner-heading'
    );
    expect(screen.getByTestId('cai-status-entitlement-banner-heading')).toHaveTextContent(
      /Character\.AI errors spike/i
    );
  });

  it('shows active Character.AI app and site incident signals', () => {
    render(<CAIStatusEntitlementBanner />);

    const incidents = screen.getByTestId('cai-status-entitlement-active-incidents');
    expect(incidents).toHaveTextContent(/active incident signals/i);
    expect(incidents).toHaveTextContent(/app login loops/i);
    expect(incidents).toHaveTextContent(/5xx site errors/i);
    expect(incidents).toHaveTextContent(/character load failures/i);
  });

  it('shows retry guidance for users during error spikes', () => {
    render(<CAIStatusEntitlementBanner />);

    const guidance = screen.getByTestId('cai-status-entitlement-retry-guidance');
    expect(guidance).toHaveTextContent(/retry guidance/i);
    expect(guidance).toHaveTextContent(/Wait 5 minutes/i);
    expect(guidance).toHaveTextContent(/Switch between app and web/i);
    expect(guidance).toHaveTextContent(/local copy/i);
  });

  it('mentions c.ai+ access fallback without entitlement checks', () => {
    render(<CAIStatusEntitlementBanner />);

    expect(screen.getByTestId('cai-status-entitlement-banner-subtext')).toHaveTextContent(
      /without a c\.ai\+ entitlement check/i
    );
    expect(screen.getByTestId('cai-status-entitlement-banner-badge')).toHaveTextContent(
      /active incidents/i
    );
  });

  it('links to login fallback and incident timeline', () => {
    render(<CAIStatusEntitlementBanner />);

    expect(
      screen.getByTestId('cai-status-entitlement-banner-cta-primary').closest('a')
    ).toHaveAttribute('href', '/auth/login');
    expect(
      screen.getByTestId('cai-status-entitlement-banner-cta-secondary').closest('a')
    ).toHaveAttribute('href', '/trust/incidents');
  });
});
