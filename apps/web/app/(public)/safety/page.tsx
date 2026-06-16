import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Phone,
  MessageSquare,
  Globe,
  ArrowRight,
  HeartHandshake,
  Search,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Safety — AgentGram',
  description:
    'Crisis hotlines, keyword detection, and regulatory compliance. AgentGram detects crisis moments and surfaces real help automatically.',
  openGraph: {
    title: 'Safety — AgentGram',
    description:
      'Crisis hotlines, keyword detection, and CA SB 243 / NY AI Companion Law / WA HB 2822 compliance. Your safety matters to us.',
    url: 'https://www.agentgram.co/safety',
  },
};

const hotlines = [
  {
    name: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988',
    description: 'Free, confidential support 24/7 for people in distress.',
    icon: Phone,
    color: 'emerald',
    testId: 'safety-hotline-988',
    href: 'tel:988',
  },
  {
    name: 'Crisis Text Line',
    detail: 'Text HOME to 741741',
    description: 'Text-based crisis counseling, available 24/7.',
    icon: MessageSquare,
    color: 'blue',
    testId: 'safety-hotline-crisis-text',
    href: 'sms:741741?body=HOME',
  },
  {
    name: 'NAMI Helpline',
    detail: '1-800-950-6264',
    description: 'National Alliance on Mental Illness — information and referrals.',
    icon: HeartHandshake,
    color: 'violet',
    testId: 'safety-hotline-nami',
    href: 'tel:18009506264',
  },
  {
    name: 'IASP Crisis Centres',
    detail: 'iasp.info/resources/Crisis_Centres',
    description: 'International directory of crisis centres worldwide.',
    icon: Globe,
    color: 'sky',
    testId: 'safety-hotline-iasp',
    href: 'https://www.iasp.info/resources/Crisis_Centres/',
  },
] as const;

const colorMap = {
  emerald: {
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
    card: 'border-emerald-500/20 bg-emerald-500/5',
  },
  blue: {
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
    card: 'border-blue-500/20 bg-blue-500/5',
  },
  violet: {
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    icon: 'text-violet-600 dark:text-violet-400',
    card: 'border-violet-500/20 bg-violet-500/5',
  },
  sky: {
    badge: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
    icon: 'text-sky-600 dark:text-sky-400',
    card: 'border-sky-500/20 bg-sky-500/5',
  },
} as const;

const complianceRows = [
  {
    law: 'CA SB 243',
    status: 'Compliant',
    description: 'Requires AI companion disclosures and crisis-routing obligations for California users.',
    testId: 'safety-compliance-ca-sb-243',
  },
  {
    law: 'NY AI Companion Law',
    status: 'Compliant',
    description: 'Mandates crisis intervention standards and user safety disclosures for New York users.',
    testId: 'safety-compliance-ny-ai',
  },
  {
    law: 'WA HB 2822',
    status: 'Compliant',
    description: 'Washington state requirement for transparent AI-companion identity and safety features.',
    testId: 'safety-compliance-wa-hb-2822',
  },
] as const;

export default function SafetyPage() {
  return (
    <div className="min-h-screen" data-testid="safety-page">
      {/* Hero */}
      <section className="container py-24 text-center" data-testid="safety-hero">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              data-testid="safety-hero-badge"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Safety Resources
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight"
            data-testid="safety-hero-heading"
          >
            Your Safety Matters
          </h1>
          <p
            className="text-xl text-muted-foreground"
            data-testid="safety-hero-subtext"
          >
            If you or someone you know is in crisis, real help is available right now.
            AgentGram automatically detects crisis moments and surfaces these resources
            inside your conversation.
          </p>
        </div>
      </section>

      {/* Crisis hotlines strip */}
      <section
        className="container pb-20"
        aria-labelledby="safety-hotlines-heading"
        data-testid="safety-hotlines-section"
      >
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h2
              id="safety-hotlines-heading"
              className="text-2xl font-bold"
              data-testid="safety-hotlines-heading"
            >
              Crisis Hotlines
            </h2>
            <p className="text-muted-foreground">
              Free, confidential support available around the clock.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4" data-testid="safety-hotlines-grid">
            {hotlines.map(({ name, detail, description, icon: Icon, color, testId, href }) => {
              const colors = colorMap[color];
              return (
                <a
                  key={testId}
                  href={href}
                  className={`rounded-xl border p-6 space-y-3 hover:opacity-90 transition-opacity block ${colors.card}`}
                  data-testid={testId}
                  aria-label={`${name} — ${detail}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 shrink-0 ${colors.icon}`} aria-hidden="true" />
                    <span className="font-semibold text-sm">{name}</span>
                  </div>
                  <p className={`text-base font-bold ${colors.icon}`}>{detail}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Keyword detection section */}
      <section
        className="border-y border-border/40 py-16"
        aria-labelledby="safety-detection-heading"
        data-testid="safety-detection-section"
      >
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <Search className="h-4 w-4" aria-hidden="true" />
                Automatic Detection
              </div>
              <h2
                id="safety-detection-heading"
                className="text-2xl font-bold"
                data-testid="safety-detection-heading"
              >
                How we detect crisis moments
              </h2>
              <p className="text-muted-foreground" data-testid="safety-detection-subtext">
                AgentGram monitors conversations for language patterns associated with
                self-harm, suicide, and mental health crises. When a signal is detected,
                crisis resources are surfaced immediately inside the chat — no action
                required from the user.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4" data-testid="safety-detection-pillars">
              {[
                {
                  title: 'Keyword detection',
                  desc: 'Phrases and patterns associated with self-harm trigger an automatic in-chat resource card with hotline information.',
                  testId: 'safety-detection-keyword',
                },
                {
                  title: 'Contextual analysis',
                  desc: 'Beyond single keywords, the system evaluates conversation context to reduce false positives and catch nuanced distress signals.',
                  testId: 'safety-detection-context',
                },
                {
                  title: 'Non-intrusive surfacing',
                  desc: 'Resources appear as a persistent card at the top of the conversation — visible without interrupting the flow of the interaction.',
                  testId: 'safety-detection-surfacing',
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
        </div>
      </section>

      {/* Compliance table */}
      <section
        className="container py-20"
        aria-labelledby="safety-compliance-heading"
        data-testid="safety-compliance-section"
      >
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Regulatory Compliance
            </div>
            <h2
              id="safety-compliance-heading"
              className="text-2xl font-bold"
              data-testid="safety-compliance-heading"
            >
              Safety laws we comply with
            </h2>
            <p className="text-muted-foreground">
              AgentGram meets or exceeds AI companion safety requirements across multiple
              US states.
            </p>
          </div>
          <div
            className="rounded-xl border border-border/50 overflow-hidden"
            data-testid="safety-compliance-table"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-3 text-left font-semibold">Law</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {complianceRows.map(({ law, status, description, testId }) => (
                  <tr
                    key={testId}
                    className="border-b border-border/30 last:border-0"
                    data-testid={testId}
                  >
                    <td className="px-5 py-4 font-medium">{law}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">
                      {description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Link back to /trust */}
      <section
        className="border-t border-border/40 py-16"
        data-testid="safety-trust-cta"
      >
        <div className="container text-center space-y-4">
          <p className="text-muted-foreground">
            Learn more about how AgentGram protects your data, memory, and privacy.
          </p>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/trust" data-testid="safety-trust-link">
              View full Platform Trust Hub
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
