import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaidConversionSocialProofBlock } from '@/components/pricing/PaidConversionSocialProofBlock';

describe('PaidConversionSocialProofBlock', () => {
  it('renders the block container', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(
      screen.getByTestId('paid-conversion-social-proof-block')
    ).toBeInTheDocument();
  });

  it('renders the upgrade counter section', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(screen.getByTestId('paid-conversion-counter')).toBeInTheDocument();
  });

  it('displays the correct upgraded-this-week count', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(screen.getByTestId('paid-conversion-count')).toHaveTextContent(
      '1,247'
    );
  });

  it('counter text mentions upgrading to Pro or Starter', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(screen.getByTestId('paid-conversion-counter')).toHaveTextContent(
      /upgraded to Pro or Starter/i
    );
  });

  it('renders the testimonials container', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(
      screen.getByTestId('paid-conversion-testimonials')
    ).toBeInTheDocument();
  });

  it('renders all three testimonials', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(
      screen.getByTestId('paid-conversion-testimonial-jordan-k')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('paid-conversion-testimonial-maya-r')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('paid-conversion-testimonial-alex-t')
    ).toBeInTheDocument();
  });

  it('testimonial jordan-k contains the expected quote text', () => {
    render(<PaidConversionSocialProofBlock />);
    const card = screen.getByTestId('paid-conversion-testimonial-jordan-k');
    expect(card).toHaveTextContent(/upgraded after day 3/i);
  });

  it('testimonial maya-r mentions API calls', () => {
    render(<PaidConversionSocialProofBlock />);
    const card = screen.getByTestId('paid-conversion-testimonial-maya-r');
    expect(card).toHaveTextContent(/50,000 API calls/i);
  });

  it('testimonial alex-t mentions Visual Memory mind map', () => {
    render(<PaidConversionSocialProofBlock />);
    const card = screen.getByTestId('paid-conversion-testimonial-alex-t');
    expect(card).toHaveTextContent(/Visual Memory mind map/i);
  });

  it('does not render the upgrade CTA when onUpgrade is not provided', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(
      screen.queryByTestId('paid-conversion-upgrade-cta')
    ).not.toBeInTheDocument();
  });

  it('renders the upgrade CTA button when onUpgrade prop is provided', () => {
    render(<PaidConversionSocialProofBlock onUpgrade={vi.fn()} />);
    expect(
      screen.getByTestId('paid-conversion-upgrade-cta')
    ).toBeInTheDocument();
  });

  it('calls onUpgrade when CTA is clicked', () => {
    const onUpgrade = vi.fn();
    render(<PaidConversionSocialProofBlock onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByTestId('paid-conversion-upgrade-cta'));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it('has the correct aria-label on the section', () => {
    render(<PaidConversionSocialProofBlock />);
    expect(
      screen.getByRole('region', { name: /upgrade social proof/i })
    ).toBeInTheDocument();
  });
});
