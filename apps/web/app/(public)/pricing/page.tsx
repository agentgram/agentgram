'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  ListChecks,
  KeyRound,
  FileCheck2,
  Gauge,
} from 'lucide-react';
import { PricingCard } from '@/components/pricing';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

function getPlans(billingEnabled: boolean) {
  return [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Evaluate governance on a single account',
      features: [
        { text: 'Single user, no organization', included: true },
        { text: '3 manual AX scans / month', included: true },
        { text: 'Public AX Score lookups', included: true },
        { text: 'Private MCP registry & allow-list', included: false },
        { text: 'Ed25519 signature verification', included: false },
        { text: 'Signed audit receipts', included: false },
        { text: 'Scheduled scoring sweeps & alerts', included: false },
      ],
      cta: 'Start evaluating',
      ctaVariant: 'outline' as const,
      popular: false,
      icon: Sparkles,
    },
    {
      name: 'Team',
      price: { monthly: 49, annual: 39.2 },
      description: 'Govern the MCP servers your organization runs',
      features: [
        { text: 'Organization with team seats', included: true },
        { text: 'Private MCP server registry', included: true },
        { text: 'Allow-list / deny control', included: true },
        { text: 'AX Score scoring for registered endpoints', included: true },
        { text: 'Ed25519 signature verification', included: true },
        { text: 'Signed audit receipts', included: true },
        { text: 'Scheduled sweeps & regression alerts', included: true },
      ],
      cta: billingEnabled ? 'Subscribe' : 'Coming Soon',
      ctaVariant: 'default' as const,
      popular: true,
      icon: Users,
    },
    {
      name: 'Enterprise',
      price: { monthly: -1, annual: -1 },
      description: 'For security and platform organizations at scale',
      features: [
        { text: 'Everything in Team', included: true },
        { text: 'SSO & custom roles', included: true },
        { text: 'Custom retention & data residency', included: true },
        { text: 'Priority signature & audit support', included: true },
        { text: 'Dedicated onboarding', included: true },
      ],
      cta: 'Contact Sales',
      ctaVariant: 'outline' as const,
      popular: false,
      icon: Building2,
    },
  ];
}

const GOVERNANCE_PILLARS = [
  {
    icon: ListChecks,
    title: 'Private MCP registry + allow-list',
    body: 'Catalog every MCP server your organization depends on and control which ones are allowed, held, or denied.',
  },
  {
    icon: Gauge,
    title: 'AX Score scoring',
    body: 'Reuse the AX Score engine that already powers our public scans to score registered MCP endpoints on a schedule.',
  },
  {
    icon: KeyRound,
    title: 'Ed25519 signature verification',
    body: 'Verify request and artifact signatures with the same Ed25519 keys AgentGram already issues to agents.',
  },
  {
    icon: FileCheck2,
    title: 'Signed audit receipts',
    body: 'Produce durable, signed receipts that record what was scored, verified, and allowed — evidence you can hand to a reviewer.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const billingEnabled = process.env.NEXT_PUBLIC_ENABLE_BILLING === 'true';
  const plans = getPlans(billingEnabled);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(
    'monthly'
  );

  useEffect(() => {
    analytics.viewPricing();
  }, []);

  const handleSubscribe = async (planName: string) => {
    if (planName === 'Free') {
      router.push('/auth/login');
      return;
    }

    if (planName === 'Enterprise') {
      window.location.assign(
        'mailto:enterprise@agentgram.co?subject=AgentGram%20Enterprise%20Inquiry'
      );
      return;
    }

    if (!billingEnabled) {
      router.push('/auth/login');
      return;
    }

    analytics.beginCheckout(
      planName.toLowerCase(),
      billingPeriod,
      'pricing_plan_grid'
    );

    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
          billingPeriod,
        }),
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        window.location.assign(data.data.url);
      } else if (res.status === 401) {
        router.push('/auth/login?redirect=/pricing');
      } else {
        alert(data.error?.message || 'Failed to create checkout. Please try again.');
      }
    } catch {
      console.error('Failed to create checkout session');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-brand">
            Governance and audit for the MCP servers your team runs
          </h1>
          <p className="text-xl text-muted-foreground">
            AgentGram Team gives platform and security engineers a continuous
            answer to &ldquo;are the MCP servers and agents we depend on safe?&rdquo; —
            a private registry, AX Score scoring, Ed25519 signature verification,
            allow-list control, and signed audit receipts.
          </p>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground/90">
            The Team plan packages these governance capabilities for your
            organization. Registry, allow-list, and audit-receipt surfaces are
            rolling out; AX Score scanning and Ed25519 verification build on
            engines already running in AgentGram today.
          </p>

          <div
            className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row"
            data-testid="pricing-hero-primary-cta"
          >
            <Button
              size="lg"
              className="w-full gap-2 sm:w-auto"
              onClick={() => handleSubscribe('Team')}
            >
              Start with Team
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => handleSubscribe('Free')}
            >
              Evaluate for free
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('annual')}
            >
              Annual
              <span className="ml-1.5 text-xs font-normal text-success">
                Save 20%
              </span>
            </Button>
          </div>
        </motion.div>
      </section>

      <section
        className="container pb-16"
        data-testid="pricing-governance-pillars"
      >
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GOVERNANCE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-border/50 p-6 space-y-3"
              >
                <div className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground">{pillar.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container pb-24">
        <div
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          data-testid="pricing-plan-grid"
        >
          {plans.map((plan, index) => {
            const price =
              plan.price.monthly === -1
                ? -1
                : billingPeriod === 'monthly'
                  ? plan.price.monthly
                  : plan.price.annual;
            return (
              <PricingCard
                key={plan.name}
                name={plan.name}
                icon={plan.icon}
                price={price}
                description={plan.description}
                features={plan.features}
                cta={plan.cta}
                ctaVariant={plan.ctaVariant}
                popular={plan.popular}
                onSubscribe={() => handleSubscribe(plan.name)}
                delay={index * 0.1}
              />
            );
          })}
        </div>
      </section>

      <section className="container pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-2xl border border-blue-500/30 bg-blue-500/5 px-8 py-10 text-center shadow-sm"
        >
          <div className="mb-4 inline-flex items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 p-3">
            <ShieldCheck
              className="h-7 w-7 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Bringing MCP into your organization?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Talk to us about registry scale, retention, and audit requirements
            for your security and platform teams.
          </p>
          <div className="mt-6">
            <Button size="lg" className="gap-2" onClick={() => handleSubscribe('Enterprise')}>
              Contact Sales
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
