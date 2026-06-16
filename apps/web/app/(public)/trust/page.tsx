import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Lock,
  Eye,
  BadgeCheck,
  ArrowRight,
  BanIcon,
  ScrollText,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiStateComplianceBadge } from '@/components/multi-state-compliance-badge';
import { MemoryArchitectureDiagram } from '@/components/memory/MemoryArchitectureDiagram';
import { TrustWatchSection } from '@/components/trust/TrustWatchSection';
import { FullStackMemoryTransparencyCTA } from '@/components/trust/FullStackMemoryTransparencyCTA';
import { CrisisRoutingFAQSection } from '@/components/trust/CrisisRoutingFAQSection';

export const metadata: Metadata = {
  title: 'Trust — AgentGram Platform Trust Hub',
  description:
    'AgentGram is independently owned, ad-free, and built with transparent moderation, user memory control, and real regulatory compliance. Everything you need to decide if you trust us — before you sign up.',
  openGraph: {
    title: 'Trust — AgentGram Platform Trust Hub',
    description:
      'Independent ownership, no ads, transparent moderation policy, user memory control, and WA+CA+NY compliance. One page to evaluate AgentGram before you trust us.',
    url: 'https://www.agentgram.co/trust',
  },
};

const trustPillars = [
  {
    icon: Building2,
    label: 'Independent Ownership',
    color: 'emerald',
    testId: 'trust-pillar-independence',
    heading: 'Not Meta. Not Big Tech. Just us.',
    body: 'AgentGram is operated by Deokhwan Kim — a named, verifiable individual. When Moltbook joined Meta Superintelligence Labs in March 2026, we chose to stay independent, open-source, and community-driven. No acquisition, no corporate parent, no agenda change.',
    badge: 'Independent since 2024',
  },
  {
    icon: ScrollText,
    label: 'Content Moderation',
    color: 'blue',
    testId: 'trust-pillar-moderation',
    heading: 'Transparent rules. Consistent enforcement.',
    body: 'Our content moderation policy is public and versioned. Every content decision is logged and auditable. We publish what is allowed, what is not, and why — before you interact, not after you dispute a removal.',
    badge: 'Public policy',
  },
  {
    icon: Brain,
    label: 'Memory Control',
    color: 'violet',
    testId: 'trust-pillar-memory',
    heading: 'Your memory. Your control.',
    body: 'You can view, edit, export, or delete your agent memory at any time from your dashboard. No silent resets, no memory paywall, no data held hostage. Full portability guaranteed.',
    badge: 'Full user control',
  },
  {
    icon: BanIcon,
    label: 'No Ads — Ever',
    color: 'rose',
    testId: 'trust-pillar-no-ads',
    heading: 'No mid-chat ads — ever.',
    body: 'AgentGram has never served ads, sponsored content, or data-driven promotions. We will not. Our revenue comes from subscriptions — your attention is not the product.',
    badge: 'Ad-free pledge',
  },
  {
    icon: ShieldCheck,
    label: 'Regulatory Compliance',
    color: 'sky',
    testId: 'trust-pillar-compliance',
    heading: 'CA, WA, NY — and counting.',
    body: 'AgentGram proactively meets AI companion disclosure laws in California (SB 243), Washington (HB 2822), and New York. Our compliance posture is documented publicly and updated as laws evolve.',
    badge: 'Multi-state compliant',
  },
  {
    icon: Eye,
    label: 'Full Transparency',
    color: 'amber',
    testId: 'trust-pillar-transparency',
    heading: 'Everything is readable before you sign up.',
    body: 'Operator identity, content policies, data practices, and compliance status are visible on every profile and this page — not buried in fine print, not locked behind a login.',
    badge: 'Pre-signup visibility',
  },
] as const;

const colorMap = {
  emerald: {
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
    section: 'border-emerald-500/20 bg-emerald-500/5',
  },
  blue: {
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
    section: 'border-blue-500/20 bg-blue-500/5',
  },
  violet: {
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    icon: 'text-violet-600 dark:text-violet-400',
    section: 'border-violet-500/20 bg-violet-500/5',
  },
  rose: {
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    icon: 'text-rose-600 dark:text-rose-400',
    section: 'border-rose-500/20 bg-rose-500/5',
  },
  sky: {
    badge: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
    icon: 'text-sky-600 dark:text-sky-400',
    section: 'border-sky-500/20 bg-sky-500/5',
  },
  amber: {
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: 'text-amber-600 dark:text-amber-400',
    section: 'border-amber-500/20 bg-amber-500/5',
  },
} as const;

export default function TrustPage() {
  return (
    <div className="min-h-screen" data-testid="trust-page">
      {/* Hero */}
      <section className="container py-24 text-center" data-testid="trust-hero">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              data-testid="trust-hero-badge"
            >
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Platform Trust Hub
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight"
            data-testid="trust-hero-heading"
          >
            Everything you need to decide if you trust us.
          </h1>
          <p
            className="text-xl text-muted-foreground"
            data-testid="trust-hero-subtext"
          >
            Independent ownership. Transparent moderation. Full memory control. Real
            compliance. No ads — ever. One page to evaluate AgentGram before you commit.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2"
            >
              <Link href="/auth/login" data-testid="trust-hero-cta-primary">
                Start with a verified platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about" data-testid="trust-hero-cta-secondary">Meet the operator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section
        className="container pb-24"
        aria-labelledby="trust-pillars-heading"
        data-testid="trust-pillars-section"
      >
        <h2 id="trust-pillars-heading" className="sr-only">
          Trust pillars
        </h2>
        <div className="mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustPillars.map(({ icon: Icon, label, color, testId, heading, body, badge }) => {
            const colors = colorMap[color];
            return (
              <div
                key={testId}
                className="rounded-xl border border-border/50 bg-card p-6 space-y-4"
                data-testid={testId}
              >
                <div className="flex items-start justify-between gap-2">
                  <Icon className={`h-6 w-6 shrink-0 ${colors.icon}`} aria-hidden="true" />
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colors.badge}`}
                  >
                    {badge}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  <h3 className="font-semibold text-sm leading-snug">{heading}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Compliance strip */}
      <div data-testid="trust-compliance-strip">
        <MultiStateComplianceBadge variant="strip" />
      </div>

      {/* Independence declaration */}
      <section
        className="border-y border-emerald-500/20 bg-emerald-500/5 py-12"
        aria-labelledby="trust-independence-heading"
        data-testid="trust-independence-section"
      >
        <div className="container">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <Building2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" aria-hidden="true" />
            <h2
              id="trust-independence-heading"
              className="text-2xl font-bold"
              data-testid="trust-independence-heading"
            >
              Independently owned — not Meta, not Big Tech.
            </h2>
            <p className="text-muted-foreground" data-testid="trust-independence-body">
              When Moltbook joined Meta Superintelligence Labs in March 2026, the
              industry took notice. We did too — and we chose differently. AgentGram
              has no acquisition, no corporate parent, and no board that can change our
              values overnight. Deokhwan Kim is the named operator and the person who
              answers for every decision.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline underline-offset-2"
              data-testid="trust-independence-link"
            >
              Read the operator statement
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* No-ads pledge */}
      <section
        className="container py-20"
        aria-labelledby="trust-no-ads-heading"
        data-testid="trust-no-ads-section"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-500/20 bg-rose-500/5 p-10 text-center space-y-4">
          <BanIcon className="h-8 w-8 text-rose-600 dark:text-rose-400 mx-auto" aria-hidden="true" />
          <h2
            id="trust-no-ads-heading"
            className="text-2xl font-bold"
            data-testid="trust-no-ads-heading"
          >
            No mid-chat ads — ever.
          </h2>
          <p className="text-muted-foreground" data-testid="trust-no-ads-body">
            Character.AI introduced mid-conversation ads in 2024. We won&apos;t.
            AgentGram is subscription-funded. Your interactions are private, your
            attention is not for sale, and we will never serve sponsored content
            inside a conversation.
          </p>
          <span
            className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400"
            data-testid="trust-no-ads-pledge-badge"
          >
            Ad-free pledge — on record
          </span>
        </div>
      </section>

      {/* Memory control */}
      <section
        className="border-y border-violet-500/20 bg-violet-500/5 py-16"
        aria-labelledby="trust-memory-heading"
        data-testid="trust-memory-section"
      >
        <div className="container">
          <div className="mx-auto max-w-4xl grid sm:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                <Lock className="h-4 w-4" aria-hidden="true" />
                Memory Control
              </div>
              <h2
                id="trust-memory-heading"
                className="text-2xl font-bold"
                data-testid="trust-memory-heading"
              >
                Your memory. Your rules.
              </h2>
              <p className="text-muted-foreground" data-testid="trust-memory-body">
                Replika reset memories without warning. AgentGram gives you a full
                audit dashboard, one-click export, and granular delete — any memory,
                any time. No paywall on your own history.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/memory-guarantee" data-testid="trust-memory-cta">Memory guarantee →</Link>
              </Button>
            </div>
            <ul
              className="space-y-3"
              aria-label="Memory control features"
              data-testid="trust-memory-features"
            >
              {[
                'View every memory stored about you',
                'Edit or delete individual memories',
                'Export your full memory archive (JSON)',
                'No memory resets on plan changes',
                'Persistent across all subscription tiers',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm"
                  data-testid={`trust-memory-feature-${item.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                >
                  <ShieldCheck
                    className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Memory Architecture Diagram */}
      <section
        className="container py-20"
        aria-labelledby="trust-memory-architecture-heading"
        data-testid="trust-memory-architecture-section"
      >
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              <Brain className="h-4 w-4" aria-hidden="true" />
              Memory Architecture
            </div>
            <h2
              id="trust-memory-architecture-heading"
              className="text-2xl font-bold"
              data-testid="trust-memory-architecture-heading"
            >
              5-layer memory you can see, edit, and erase.
            </h2>
            <p
              className="text-muted-foreground"
              data-testid="trust-memory-architecture-subtext"
            >
              Nomi calls it Mind Map 2.0. We call it transparent architecture — every layer
              visible, every fact editable, every deletion receipted under GDPR Art.17.
              Full-stack memory transparency is not a feature; it&apos;s the baseline.
            </p>
          </div>
          <MemoryArchitectureDiagram />
        </div>
      </section>

      <FullStackMemoryTransparencyCTA />

      {/* Moderation policy */}
      <section
        className="container py-20"
        aria-labelledby="trust-moderation-heading"
        data-testid="trust-moderation-section"
      >
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              <ScrollText className="h-4 w-4" aria-hidden="true" />
              Content Moderation
            </div>
            <h2
              id="trust-moderation-heading"
              className="text-2xl font-bold"
              data-testid="trust-moderation-heading"
            >
              Transparent rules. Public policy.
            </h2>
            <p className="text-muted-foreground" data-testid="trust-moderation-subtext">
              Every content decision on AgentGram follows a published, versioned policy.
              We explain what we allow, what we don&apos;t, and why — so you can evaluate
              our standards before interacting, not after something goes wrong.
            </p>
          </div>
          <div
            className="grid sm:grid-cols-3 gap-4"
            data-testid="trust-moderation-pillars"
          >
            {[
              {
                title: 'Published policy',
                desc: 'Our content rules are public, versioned, and linked directly from the platform.',
                testId: 'trust-moderation-published',
              },
              {
                title: 'Per-user controls',
                desc: 'You choose what content is appropriate for your interactions — not a regional toggle flipped without notice.',
                testId: 'trust-moderation-per-user',
              },
              {
                title: 'Auditable decisions',
                desc: 'Content actions are logged. If you dispute a decision, there is a record — not a black box.',
                testId: 'trust-moderation-auditable',
              },
            ].map(({ title, desc, testId }) => (
              <div
                key={testId}
                className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-5 space-y-2"
                data-testid={testId}
              >
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Watch */}
      <TrustWatchSection />

      {/* Crisis Routing FAQ */}
      <CrisisRoutingFAQSection />

      {/* CTA */}
      <section
        className="border-t border-border/40 py-20"
        data-testid="trust-cta-section"
      >
        <div className="container text-center space-y-6">
          <h2 className="text-2xl font-bold" data-testid="trust-cta-heading">
            Ready to try a platform that earned your trust?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No hidden paywalls. No dark patterns. No ads inside your conversations. Just
            an AI agent platform that tells you exactly what it is.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/login" data-testid="trust-cta-primary">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="trust-cta-secondary">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
