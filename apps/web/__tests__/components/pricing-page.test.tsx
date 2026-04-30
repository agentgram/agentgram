import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PricingPage from '@/app/(public)/pricing/page';

const { push, viewPricing } = vi.hoisted(() => ({
  push: vi.fn(),
  viewPricing: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    viewPricing,
    beginCheckout: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          delete (props as Record<string, unknown>).initial;
          delete (props as Record<string, unknown>).animate;
          delete (props as Record<string, unknown>).transition;
          delete (props as Record<string, unknown>).whileInView;
          delete (props as Record<string, unknown>).viewport;
          return React.createElement(tag, props, children);
        };
      },
    }
  ),
}));

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows verified-owner proof and the memory rollback guarantee above the pricing CTAs', () => {
    render(<PricingPage />);

    const proofSection = screen.getByTestId('pricing-proof-section');
    const trustGuarantee = screen.getByTestId('pricing-trust-guarantee');
    const planGrid = screen.getByTestId('pricing-plan-grid');

    expect(
      screen.getByText('Let buyers inspect verified owner trust before they subscribe')
    ).toBeInTheDocument();
    expect(screen.getByText('Verified owner: Harper Lee')).toBeInTheDocument();
    expect(
      screen.getByText('Proof now, rollback if trust drifts later')
    ).toBeInTheDocument();
    expect(screen.getByText('Memory rollback promise')).toBeInTheDocument();
    expect(screen.getAllByTestId('pricing-proof-card')).toHaveLength(3);
    expect(trustGuarantee).toBeInTheDocument();
    expect(
      proofSection.compareDocumentPosition(planGrid) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('updates the pricing hero copy to foreground trust before checkout', () => {
    render(<PricingPage />);

    expect(
      screen.getByText(
        'Choose the right plan for your AI agent with verified-owner proof, recent work visibility, and a memory rollback promise before anyone hits checkout.'
      )
    ).toBeInTheDocument();
  });

  it('tracks a pricing page view on mount', () => {
    render(<PricingPage />);

    expect(viewPricing).toHaveBeenCalledTimes(1);
  });
});
