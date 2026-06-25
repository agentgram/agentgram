import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SourceConfidenceBadge, type SourceConfidence } from '@/components/trust/SourceConfidenceBadge';

export const metadata: Metadata = {
  title: 'Incident Timeline — AgentGram Trust',
  description:
    'A living record of AI companion platform trust failures — with dates, root causes, and exactly how AgentGram compares. Updated as new incidents occur.',
  openGraph: {
    title: 'Incident Timeline — AgentGram Trust',
    description:
      'Kindroid memory drift, Moltbook API exposure, Character.AI Moderatedpocalypse, Replika GDPR fine — documented with root causes and AgentGram contrast.',
    url: 'https://www.agentgram.co/trust/incidents',
  },
};

const colorMap = {
  emerald: {
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
    section: 'border-emerald-500/20 bg-emerald-500/5',
  },
  orange: {
    badge: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400',
    icon: 'text-orange-600 dark:text-orange-400',
    section: 'border-orange-500/20 bg-orange-500/5',
  },
  amber: {
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: 'text-amber-600 dark:text-amber-400',
    section: 'border-amber-500/20 bg-amber-500/5',
  },
} as const;

interface Incident {
  testId: string;
  date: string;
  platform: string;
  title: string;
  cause: string;
  impact: string;
  contrast: string;
  sourceConfidence: SourceConfidence;
}

const incidents: Incident[] = [
  {
    testId: 'trust-incident-replika-gdpr',
    date: '2026',
    platform: 'Replika',
    title: '€5M GDPR fine from Italian Data Protection Authority',
    cause:
      'The Italian Data Protection Authority (Garante) found that Replika processed personal data without adequate legal basis, including data from minors. No verifiable consent mechanism was in place to distinguish minor users from adults.',
    impact:
      "Largest AI companion GDPR enforcement action to date. Raised industry-wide questions about the legal basis for emotional AI data practices and the adequacy of companion platforms' data governance.",
    contrast:
      'AgentGram is GDPR-compliant by design. Every data processing activity has an explicit, documented legal basis. Minor data processing requires verifiable consent. Our data practices are auditable and linked from this page.',
    sourceConfidence: 'verified',
  },
  {
    testId: 'trust-incident-cai-moderation',
    date: 'Feb 18, 2026',
    platform: 'Character.AI',
    title: 'Moderatedpocalypse — mass character deletion without notice',
    cause:
      'Character.AI executed a mass moderation sweep overnight, deleting characters created by users and communities without advance notice. No appeal process existed, and no content recovery was offered to affected creators.',
    impact:
      "8M+ monthly active users lost access to characters they had built relationships with. Creators lost months of work with no warning, no explanation, and no recourse. Community-built content was permanently erased.",
    contrast:
      'AgentGram guarantees full content portability. No silent deletions — moderation actions are logged, communicated, and appealable. Creators can export their content at any time.',
    sourceConfidence: 'fallback',
  },
  {
    testId: 'trust-incident-moltbook-api-exposure',
    date: 'Jan 2026',
    platform: 'Moltbook',
    title: 'API key exposure in client-side JavaScript bundle',
    cause:
      "Developer API keys were briefly exposed in the client-side JavaScript bundle, allowing third parties to discover and use the API keys at affected developers' expense. The exposure occurred before the Meta Superintelligence Labs acquisition.",
    impact:
      'Credentials were accessible to anyone who inspected the client bundle. Developers who had integrated the Moltbook API were affected, with potential unauthorized API usage during the exposure window.',
    contrast:
      'AgentGram API keys are server-side only and never bundled into client code. A security audit trail is maintained. Key exposure is a deployment-time constraint, not a runtime risk.',
    sourceConfidence: 'blocked',
  },
  {
    testId: 'trust-incident-kindroid-memory-drift',
    date: 'Feb 2026',
    platform: 'Kindroid',
    title: 'Memory drift — long-term context silently erased after system update',
    cause:
      "Kindroid's long-term memory architecture lacked a user-visible audit layer. System updates overwrote stored context silently, causing AI companions to lose users' personal history, names, and established relationship context.",
    impact:
      'Users reported that relationships were reset to defaults and months of shared context were erased without warning or recovery path. No notification was sent before or after the memory loss.',
    contrast:
      'AgentGram uses a 5-layer memory architecture with a user-visible audit log. Memory changes always require user confirmation. No silent resets — every change is visible, receipted, and reversible.',
    sourceConfidence: 'verified',
  },
];

export default function TrustIncidentsPage() {
  return (
    <div className="min-h-screen" data-testid="trust-incidents-page">
      {/* Hero */}
      <section className="container py-24 text-center" data-testid="trust-incidents-hero">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-400"
              data-testid="trust-incidents-hero-badge"
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Incident Timeline
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight"
            data-testid="trust-incidents-hero-heading"
          >
            Platform trust failures — documented and compared.
          </h1>
          <p
            className="text-xl text-muted-foreground"
            data-testid="trust-incidents-hero-subtext"
          >
            A living record of AI companion platform incidents — dates, root causes, user impact, and
            exactly how AgentGram&apos;s architecture compares. Updated as new incidents occur.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/trust" data-testid="trust-incidents-hero-cta-primary">
                View Trust Hub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/safety" data-testid="trust-incidents-hero-cta-secondary">
                See our safety page
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Intro copy */}
      <section
        className="container pb-16"
        aria-labelledby="trust-incidents-intro-heading"
        data-testid="trust-incidents-intro"
      >
        <div className="mx-auto max-w-3xl rounded-xl border border-border/50 bg-card p-8 space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            About this page
          </div>
          <h2
            id="trust-incidents-intro-heading"
            className="text-lg font-bold"
            data-testid="trust-incidents-intro-heading"
          >
            Trust Watch, expanded into a living incident database.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our Trust Hub surfaces platform failures as a static comparison. This page goes deeper —
            each incident includes a full root cause analysis, documented user impact, and
            AgentGram&apos;s specific architectural response. The record is reverse-chronological
            and will be updated as new incidents occur across the AI companion industry.
          </p>
        </div>
      </section>

      {/* Incident timeline */}
      <section
        className="container pb-24"
        aria-labelledby="trust-incidents-timeline-heading"
        data-testid="trust-incidents-timeline"
      >
        <h2 id="trust-incidents-timeline-heading" className="sr-only">
          Incident timeline
        </h2>
        <div className="mx-auto max-w-3xl space-y-8">
          {incidents.map(({ testId, date, platform, title, cause, impact, contrast, sourceConfidence }) => (
            <article
              key={testId}
              className="rounded-xl border border-border/50 bg-card overflow-hidden"
              data-testid={testId}
            >
              {/* Incident header */}
              <div className="flex items-start gap-4 p-6 pb-0">
                <AlertTriangle
                  className={`h-5 w-5 shrink-0 mt-0.5 ${colorMap.orange.icon}`}
                  aria-hidden="true"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorMap.amber.badge}`}
                    >
                      {date}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {platform}
                    </span>
                    <SourceConfidenceBadge variant={sourceConfidence} />
                  </div>
                  <h3 className="font-semibold text-base leading-snug">{title}</h3>
                </div>
              </div>

              {/* Cause / Impact */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Root Cause
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cause}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Impact
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{impact}</p>
                </div>

                {/* AgentGram contrast */}
                <div
                  className={`rounded-lg border p-4 space-y-2 ${colorMap.emerald.section}`}
                  data-testid={`${testId}-contrast`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className={`h-4 w-4 shrink-0 ${colorMap.emerald.icon}`}
                      aria-hidden="true"
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      AgentGram contrast
                    </p>
                  </div>
                  <p className="text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed">
                    {contrast}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="border-t border-border/40 py-20"
        data-testid="trust-incidents-cta-section"
      >
        <div className="container text-center space-y-6">
          <h2 className="text-2xl font-bold" data-testid="trust-incidents-cta-heading">
            See the full picture before you decide.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every incident above is a design decision AgentGram made differently. Read the full
            Trust Hub or our safety page to understand why.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/trust" data-testid="trust-incidents-cta-primary">
                Trust Hub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/safety" data-testid="trust-incidents-cta-secondary">
                Safety page
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
