import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PricingPage from '@/app/(public)/pricing/page';

const { push, viewPricing, beginCheckout, pricingProofCardClick } = vi.hoisted(
  () => ({
    push: vi.fn(),
    viewPricing: vi.fn(),
    beginCheckout: vi.fn(),
    pricingProofCardClick: vi.fn(),
  })
);

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock('@/lib/analytics', () => ({
  analytics: {
    viewPricing,
    beginCheckout,
    pricingProofCardClick,
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
    process.env.NEXT_PUBLIC_ENABLE_BILLING = 'true';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { url: 'https://checkout.example.com/session' },
        }),
      })
    );
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign: vi.fn(),
      },
    });
  });

  it('shows quote-card and group-chat pricing examples plus verified-owner proof cards above the plan CTAs', () => {
    render(<PricingPage />);

    const proofSection = screen.getByTestId('pricing-proof-section');
    const galleryGrid = screen.getByTestId('pricing-gallery-grid');
    const trustGuarantee = screen.getByTestId('pricing-trust-guarantee');
    const auditCta = screen.getByTestId('pricing-audit-cta');
    const planGrid = screen.getByTestId('pricing-plan-grid');

    expect(
      screen.getByText(
        'The Character.AI alternative with verified ownership and memory you can trust'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'AgentGram Operator lets buyers inspect who runs the persona, how memory behaves, and what permission and retention policy stands behind it before they upgrade.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Operator guarantee: Deokhwan Kim and the AgentGram team personally stand behind the verified ownership and memory policy shown on this page.'
      )
    ).toBeInTheDocument();
    const heroCta = screen.getByTestId('pricing-hero-primary-cta');
    expect(
      screen.getByRole('button', { name: /start with pro/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create a free agent/i })
    ).toBeInTheDocument();
    expect(
      heroCta.compareDocumentPosition(planGrid) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Let buyers inspect verified owner trust before they subscribe'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Quote-card proof buyers can screenshot')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Group-chat examples make collaboration legible before upgrade'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Verified owner: Harper Lee')).toBeInTheDocument();
    expect(
      screen.getByText('Proof now, rollback if trust drifts later')
    ).toBeInTheDocument();
    expect(screen.getByText('Memory rollback promise')).toBeInTheDocument();
    expect(screen.getByText('Memory onboarding audit')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Turn saved facts and owner proof into a buyer-ready launch review'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /book memory audit/i })
    ).toHaveAttribute(
      'href',
      'mailto:enterprise@agentgram.co?subject=AgentGram%20memory%20onboarding%20audit'
    );
    expect(screen.getAllByTestId('pricing-gallery-card')).toHaveLength(2);
    expect(screen.getAllByTestId('pricing-proof-card')).toHaveLength(3);
    expect(galleryGrid).toBeInTheDocument();
    expect(trustGuarantee).toBeInTheDocument();
    expect(auditCta).toBeInTheDocument();
    expect(
      proofSection.compareDocumentPosition(planGrid) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('starts checkout from the first-viewport Pro CTA', async () => {
    render(<PricingPage />);

    fireEvent.click(screen.getByRole('button', { name: /start with pro/i }));

    expect(beginCheckout).toHaveBeenCalledWith(
      'pro',
      'monthly',
      'pricing_plan_grid',
      undefined
    );
  });

  it('routes free-agent onboarding from the first-viewport secondary CTA', () => {
    render(<PricingPage />);

    fireEvent.click(
      screen.getByRole('button', { name: /create a free agent/i })
    );

    expect(push).toHaveBeenCalledWith('/dashboard/onboard');
  });

  it('tracks a pricing page view on mount', () => {
    render(<PricingPage />);

    expect(viewPricing).toHaveBeenCalledTimes(1);
  });

  it('renders the Replika price-tier confusion counter callout with all three tiers listed', () => {
    render(<PricingPage />);

    const callout = screen.getByTestId('replika-pricing-confusion-callout');
    expect(callout).toBeInTheDocument();

    expect(
      screen.getByTestId('replika-callout-headline')
    ).toHaveTextContent('One clear plan. No Ultra/Pro/Plus confusion.');

    const tierList = screen.getByTestId('replika-tier-list');
    expect(tierList).toHaveTextContent('Replika Plus $7.99/mo');
    expect(tierList).toHaveTextContent('Replika Pro $14.99/mo');
    expect(tierList).toHaveTextContent('Replika Ultra $49.99/yr');

    expect(
      screen.getByTestId('replika-callout-agentgram-badge')
    ).toHaveTextContent('Transparent pricing, no tier confusion');
  });

  it('renders Visual Memory mind map section with Nomi parity badge and Starter+ callout', () => {
    render(<PricingPage />);

    const section = screen.getByTestId('pricing-visual-memory-section');
    expect(section).toBeInTheDocument();

    const badge = screen.getByTestId('pricing-visual-memory-badge');
    expect(badge).toHaveTextContent('Visual Memory mind map — Nomi Mind Map 2.0 parity');

    expect(
      screen.getByText('See exactly what your agent remembers — no guessing')
    ).toBeInTheDocument();
    expect(section).toHaveTextContent('Included in Starter+');
  });

  it('shows Visual Memory mind map in the feature comparison table as Starter/Pro only', () => {
    render(<PricingPage />);

    const row = screen.getByTestId('pricing-visual-memory-row');
    expect(row).toBeInTheDocument();
    expect(row).toHaveTextContent('Visual Memory mind map');
    expect(row).toHaveTextContent('vs. Nomi Mind Map 2.0 paid-only');
  });

  it('logs proof-card clicks and carries the trust-surface source into checkout starts', async () => {
    render(<PricingPage />);

    fireEvent.click(screen.getAllByTestId('pricing-proof-card')[0]);

    expect(pricingProofCardClick).toHaveBeenCalledWith(
      'deploy-notes',
      'Release notes + CI receipt'
    );

    fireEvent.click(screen.getAllByRole('button', { name: /subscribe/i })[0]);

    expect(beginCheckout).toHaveBeenCalledWith(
      'starter',
      'monthly',
      'pricing_proof_section',
      'deploy-notes'
    );
  });
});
