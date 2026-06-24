import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MobileWebPricingBanner } from '@/components/pricing/MobileWebPricingBanner';

const DISMISS_KEY = 'mobile-web-pricing-banner-dismissed';

function makeLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _reset: () => { store = {}; },
  };
}

const localStorageMock = makeLocalStorageMock();

vi.stubGlobal('localStorage', localStorageMock);

describe('MobileWebPricingBanner', () => {
  beforeEach(() => {
    localStorageMock._reset();
    vi.clearAllMocks();
  });

  it('renders the banner when not dismissed', () => {
    render(<MobileWebPricingBanner />);
    expect(screen.getByTestId('mobile-web-pricing-banner')).toBeInTheDocument();
  });

  it('displays the web price advantage headline', () => {
    render(<MobileWebPricingBanner />);
    const headline = screen.getByTestId('mobile-web-pricing-headline');
    expect(headline.textContent).toMatch(/Subscribe on web/i);
    expect(headline.textContent).toMatch(/no app store markup/i);
  });

  it('shows web price vs app store price comparison', () => {
    render(<MobileWebPricingBanner />);
    const comparison = screen.getByTestId('mobile-web-pricing-comparison');
    expect(comparison).toBeInTheDocument();
    expect(screen.getByTestId('web-price-label').textContent).toMatch(/Web:/i);
    expect(screen.getByTestId('app-store-price-label').textContent).toMatch(/iOS\/Android/i);
    expect(screen.getByTestId('app-store-price-label').textContent).toMatch(/30%/i);
  });

  it('renders the Subscribe on web CTA link pointing to /pricing#plans', () => {
    render(<MobileWebPricingBanner />);
    const cta = screen.getByTestId('mobile-web-pricing-cta');
    expect(cta).toBeInTheDocument();
    expect(cta.textContent).toMatch(/Subscribe on web/i);
    expect(cta.getAttribute('href')).toBe('/pricing#plans');
  });

  it('shows Kindroid counter-positioning copy', () => {
    render(<MobileWebPricingBanner />);
    const counter = screen.getByTestId('mobile-web-pricing-counter');
    expect(counter.textContent).toMatch(/Kindroid/i);
    expect(counter.textContent).toMatch(/web price is always our best price/i);
  });

  it('renders the dismiss button with accessible label', () => {
    render(<MobileWebPricingBanner />);
    const dismissBtn = screen.getByTestId('mobile-web-pricing-dismiss');
    expect(dismissBtn).toBeInTheDocument();
    expect(dismissBtn).toHaveAttribute('aria-label', 'Dismiss pricing banner');
  });

  it('hides the banner after clicking dismiss', () => {
    render(<MobileWebPricingBanner />);
    const dismissBtn = screen.getByTestId('mobile-web-pricing-dismiss');
    fireEvent.click(dismissBtn);
    expect(screen.queryByTestId('mobile-web-pricing-banner')).not.toBeInTheDocument();
  });

  it('persists dismissed state to localStorage', () => {
    render(<MobileWebPricingBanner />);
    const dismissBtn = screen.getByTestId('mobile-web-pricing-dismiss');
    fireEvent.click(dismissBtn);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(DISMISS_KEY, 'true');
  });

  it('does not render when localStorage flag is already set', () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === DISMISS_KEY ? 'true' : null
    );
    render(<MobileWebPricingBanner />);
    expect(screen.queryByTestId('mobile-web-pricing-banner')).not.toBeInTheDocument();
  });
});
