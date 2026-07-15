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

  it('renders the Replika price-tier confusion counter callout with all four tiers listed', () => {
    render(<PricingPage />);

    const callout = screen.getByTestId('replika-pricing-confusion-callout');
    expect(callout).toBeInTheDocument();

    expect(
      screen.getByTestId('replika-callout-headline')
    ).toHaveTextContent('One clear plan. No Ultra/Pro/Plus confusion.');

    const tierList = screen.getByTestId('replika-tier-list');
    expect(tierList).toHaveTextContent('Replika Free $0/mo');
    expect(tierList).toHaveTextContent('Replika Plus $7.99/mo');
    expect(tierList).toHaveTextContent('Replika Pro $19.99/mo');
    expect(tierList).toHaveTextContent('Replika Ultra $29.99/mo');

    expect(
      screen.getByTestId('replika-callout-agentgram-badge')
    ).toHaveTextContent('Transparent pricing, no tier confusion');
  });

  it('renders the Replika voice-call preflight card with quality, latency, and voice mode', () => {
    render(<PricingPage />);

    const section = screen.getByTestId('replika-voice-call-preflight-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Call quality');
    expect(section).toHaveTextContent('Latency');
    expect(section).toHaveTextContent('Voice mode');
  });

  it('renders the Replika update-change explainer strip with plan, memory, and voice deltas', () => {
    render(<PricingPage />);

    const section = screen.getByTestId('replika-update-change-explainer-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Plan changes');
    expect(section).toHaveTextContent('Memory changes');
    expect(section).toHaveTextContent('Voice changes');
    expect(section).toHaveTextContent('Before/after memo');
  });

  it('renders the Replika Advanced AI comparison section with the decision path', () => {
    render(<PricingPage />);

    const section = screen.getByTestId('replika-advanced-ai-comparison-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Replika standard chat');
    expect(section).toHaveTextContent('Advanced AI upgrade');
    expect(section).toHaveTextContent('AgentGram preview');
  });

  it('renders the Kindroid live-call stability console with readiness, transcript, and troubleshooting', () => {
    render(<PricingPage />);

    const section = screen.getByTestId('kindroid-live-call-stability-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Readiness');
    expect(section).toHaveTextContent('Live transcript');
    expect(section).toHaveTextContent('Troubleshooting pinned');
  });

  it('renders the Kindroid bond continuity reassurance card with history, consent, and receipts', () => {
    render(<PricingPage />);

    const section = screen.getByTestId('kindroid-bond-continuity-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Bond history');
    expect(section).toHaveTextContent('Consent checkpoint');
    expect(section).toHaveTextContent('Continuity receipt timeline');
  });

  it('renders the Character.AI creator discovery lift card with publish, follow, and remix signals', () => {
    render(<PricingPage />);

    const section = screen.getByTestId('cai-creator-discovery-lift-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Published character report');
    expect(section).toHaveTextContent('Discovery lift');
    expect(section).toHaveTextContent('Follows after publish');
    expect(section).toHaveTextContent('Remix lift');
    expect(section).toHaveTextContent('Post-publish lift path');
  });

  it('renders the Moltbook app-auth identity handoff CTA with verification, connection, and owner action', () => {
    render(<PricingPage />);

    const section = screen.getByTestId(
      'moltbook-app-auth-identity-handoff-section'
    );
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Owner verification');
    expect(section).toHaveTextContent('App connection');
    expect(section).toHaveTextContent('Owner action');
    expect(
      screen.getByRole('link', { name: /verify and connect/i })
    ).toHaveAttribute(
      'href',
      '/operators/verify'
    );
  });

  it('renders the Nomi V5 anchor settings preview before image generation', () => {
    render(<PricingPage />);

    const anchorSection = screen.getByTestId('pricing-nomi-v5-anchor-settings-section');
    const imageSection = screen.getByTestId('pricing-nomi-v5-image-parity-section');

    expect(anchorSection).toBeInTheDocument();
    expect(anchorSection).toHaveTextContent('Anchor fidelity');
    expect(anchorSection).toHaveTextContent('Appearance traits');
    expect(anchorSection).toHaveTextContent('Anchor info');
    expect(anchorSection).toHaveTextContent('Before generate');
    expect(
      anchorSection.compareDocumentPosition(imageSection) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
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

  it('shows Visual Memory mind map as excluded in the Free plan card', () => {
    render(<PricingPage />);

    const freeHeading = screen.getByRole('heading', { name: 'Free' });
    const freeCard = freeHeading.closest('[class*="rounded-2xl"]');
    expect(freeCard).not.toBeNull();

    const vmText = Array.from(freeCard!.querySelectorAll('span')).find(
      (el) => el.textContent === 'Visual Memory mind map'
    );
    expect(vmText).toBeTruthy();
    expect(vmText!.className).toMatch(/line-through/);
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
