import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FreeTrial7DayCTA } from '@/components/free-trial-cta';

describe('FreeTrial7DayCTA', () => {
  it('renders the free trial CTA container', () => {
    render(<FreeTrial7DayCTA />);
    expect(screen.getByTestId('free-trial-7day-cta')).toBeInTheDocument();
  });

  it('shows correct trial copy text', () => {
    render(<FreeTrial7DayCTA />);
    expect(screen.getByTestId('free-trial-7day-cta-button')).toHaveTextContent(
      'Try free for 7 days — no credit card required'
    );
  });

  it('links to the onboarding flow', () => {
    render(<FreeTrial7DayCTA />);
    const link = screen.getByTestId('free-trial-7day-cta-button');
    expect(link).toHaveAttribute('href', '/dashboard/onboard');
  });

  it('applies custom className to wrapper', () => {
    render(<FreeTrial7DayCTA className="flex justify-center" />);
    const wrapper = screen.getByTestId('free-trial-7day-cta');
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('justify-center');
  });
});
