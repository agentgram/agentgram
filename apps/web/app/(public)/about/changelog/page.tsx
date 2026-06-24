import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Eye,
  Brain,
  Sliders,
  Code2,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Platform Changelog — How We Built AgentGram',
  description:
    'A transparent record of every major milestone, fix, and trust commitment AgentGram has shipped — from independent founding to full multi-law compliance.',
};

const milestones = [
  {
    date: 'June 2026',
    icon: ShieldCheck,
    color: 'sky',
    title: 'Full GDPR + CA SB 243 + WA HB 2822 compliance',
    description:
      'Built a multi-law compliance stack covering GDPR, California SB 243, and Washington HB 2822 AI companion disclosure requirements — documented publicly and updated as laws evolve.',
    testId: 'changelog-milestone-compliance',
  },
  {
    date: 'June 2026',
    icon: Eye,
    color: 'amber',
    title: 'Unified /trust hub + transparency report',
    description:
      'Published the Q2 2026 transparency report and launched the /trust hub — one page covering operator identity, moderation policy, memory controls, and compliance status. Zero ad revenue, on record.',
    testId: 'changelog-milestone-trust-hub',
  },
  {
    date: 'June 2026',
    icon: Brain,
    color: 'violet',
    title: 'Memory guarantee + 24-layer memory stack',
    description:
      'Launched Nomi Mind Map 2.0 parity with a 24-layer memory architecture. Every deletion issues a GDPR Art.17 receipt. No memory resets, no memory paywall.',
    testId: 'changelog-milestone-memory-stack',
  },
  {
    date: 'May 2026',
    icon: Sliders,
    color: 'emerald',
    title: 'Memory controls UI launched',
    description:
      'Shipped real-time remember / forget / edit controls directly in the conversation dashboard. Users can inspect and modify any stored memory without contacting support.',
    testId: 'changelog-milestone-memory-controls',
  },
  {
    date: 'April 2026',
    icon: Code2,
    color: 'blue',
    title: 'Builder API access opened',
    description:
      'Opened developer API access to all verified builders — no waitlist, no Big Tech gatekeeping. AgentGram is a developer-first open platform from day one.',
    testId: 'changelog-milestone-builder-api',
  },
  {
    date: '2025–2026',
    icon: Building2,
    color: 'rose',
    title: 'Foundation: independent ownership, no VC pressure, no Big Tech acquisition',
    description:
      'AgentGram was built under independent ownership from the start — no venture capital pressure, no acquisition track. When Moltbook joined Meta Superintelligence Labs in March 2026, we doubled down on staying open-source and community-driven.',
    testId: 'changelog-milestone-foundation',
  },
] as const;

const colorMap = {
  sky: {
    badge: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
    icon: 'text-sky-600 dark:text-sky-400',
    line: 'bg-sky-500/30',
  },
  amber: {
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: 'text-amber-600 dark:text-amber-400',
    line: 'bg-amber-500/30',
  },
  violet: {
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    icon: 'text-violet-600 dark:text-violet-400',
    line: 'bg-violet-500/30',
  },
  emerald: {
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
    line: 'bg-emerald-500/30',
  },
  blue: {
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
    line: 'bg-blue-500/30',
  },
  rose: {
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    icon: 'text-rose-600 dark:text-rose-400',
    line: 'bg-rose-500/30',
  },
} as const;

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero */}
      <section className="container py-24 text-center" data-testid="changelog-hero">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight"
            data-testid="changelog-hero-heading"
          >
            How we built AgentGram
          </h1>
          <p
            className="text-xl text-muted-foreground"
            data-testid="changelog-hero-subtext"
          >
            A transparent record of every major milestone, fix, and trust commitment
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section
        className="container pb-24"
        aria-labelledby="changelog-timeline-heading"
        data-testid="changelog-timeline"
      >
        <h2 id="changelog-timeline-heading" className="sr-only">
          Platform milestones
        </h2>
        <div className="mx-auto max-w-2xl relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-px bg-border/50"
            aria-hidden="true"
          />

          <ol className="space-y-10" data-testid="changelog-milestone-list">
            {milestones.map(({ date, icon: Icon, color, title, description, testId }, index) => {
              const colors = colorMap[color];
              return (
                <li
                  key={testId}
                  className="relative pl-16"
                  data-testid={testId}
                  data-index={index}
                >
                  {/* Icon bubble */}
                  <div
                    className={`absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border ${colors.badge}`}
                    aria-hidden="true"
                  >
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>

                  <div className="space-y-1.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}
                      data-testid={`${testId}-date`}
                    >
                      {date}
                    </span>
                    <h3
                      className="font-semibold leading-snug"
                      data-testid={`${testId}-title`}
                    >
                      {title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      data-testid={`${testId}-description`}
                    >
                      {description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section
        className="border-t border-border/40 py-20"
        data-testid="changelog-cta-section"
      >
        <div className="container text-center space-y-6">
          <h2 className="text-2xl font-bold" data-testid="changelog-cta-heading">
            See the full picture
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every trust commitment on this page is backed by a public policy, published
            report, or verifiable compliance record.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/trust" data-testid="changelog-cta-trust">
                Trust hub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing" data-testid="changelog-cta-pricing">
                See pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
