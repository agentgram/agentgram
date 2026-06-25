import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart,
  AlertTriangle,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowLeft,
  Shield,
  Users,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Mental Health & AI Companionship — AgentGram',
  description:
    'Responsible AI companionship guidance: when AI supports, when to seek professional help, and how AgentGram is designed around your long-term wellbeing.',
  openGraph: {
    title: 'Mental Health & AI Companionship — AgentGram',
    description:
      "Learn how to use AI companionship responsibly, recognize when to seek professional support, and understand AgentGram's wellbeing-first design philosophy.",
    url: 'https://www.agentgram.co/safety/mental-health',
  },
};

const warningSignals = [
  'You feel unable to cope without the AI companion',
  'Real-world relationships are suffering',
  'You are experiencing thoughts of self-harm or suicide',
  'Sleep, eating, or daily functioning is disrupted',
  'You feel the AI understands you better than any human',
  'You are avoiding professional help because the AI feels "enough"',
  'Feelings of loneliness intensify after sessions end',
] as const;

const designPrinciples = [
  {
    icon: Heart,
    title: 'Relationship health over engagement',
    body: 'AgentGram does not optimise for session length or daily streaks. We optimise for conversations that leave you feeling better, not more dependent.',
    testId: 'mh-principle-relationship-health',
    color: 'rose',
  },
  {
    icon: Users,
    title: 'Autonomy and human connection',
    body: 'Our AI companions are designed to encourage — not replace — human relationships. Conversations that reinforce real-world social bonds are a feature, not a bug.',
    testId: 'mh-principle-autonomy',
    color: 'violet',
  },
  {
    icon: BookOpen,
    title: 'Transparent escalation to professionals',
    body: 'When distress signals are detected, AgentGram surfaces verified professional resources in-conversation — immediately and without shame.',
    testId: 'mh-principle-escalation',
    color: 'blue',
  },
] as const;

const colorMap = {
  rose: {
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    icon: 'text-rose-600 dark:text-rose-400',
    card: 'border-rose-500/20 bg-rose-500/5',
  },
  violet: {
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    icon: 'text-violet-600 dark:text-violet-400',
    card: 'border-violet-500/20 bg-violet-500/5',
  },
  blue: {
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
    card: 'border-blue-500/20 bg-blue-500/5',
  },
} as const;

const crisisResources = [
  {
    name: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988',
    description: 'Free, confidential support 24/7 for people in distress in the US.',
    icon: Phone,
    color: 'emerald' as const,
    testId: 'mh-crisis-988',
    href: 'tel:988',
  },
  {
    name: 'Crisis Text Line',
    detail: 'Text HOME to 741741',
    description: 'Text-based crisis counseling, available 24/7 in the US.',
    icon: MessageSquare,
    color: 'blue' as const,
    testId: 'mh-crisis-text',
    href: 'sms:741741?body=HOME',
  },
] as const;

const crisisColorMap = {
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    card: 'border-emerald-500/20 bg-emerald-500/5',
  },
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    card: 'border-blue-500/20 bg-blue-500/5',
  },
} as const;

export default function MentalHealthGuidancePage() {
  return (
    <div className="min-h-screen" data-testid="mental-health-page">
      {/* Back nav */}
      <div className="container pt-8">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/safety" data-testid="mh-back-link">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Safety
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <section className="container py-16 text-center" data-testid="mh-hero">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-400"
              data-testid="mh-hero-badge"
            >
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              Mental Health Guidance
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight"
            data-testid="mh-hero-heading"
          >
            Mental Health &amp; AI Companionship
          </h1>
          <p
            className="text-xl text-muted-foreground"
            data-testid="mh-hero-subtext"
          >
            AI companions can be a meaningful source of support — and they work best alongside
            human relationships and professional care, not instead of them.
          </p>
        </div>
      </section>

      {/* Section 1: Responsible use */}
      <section
        className="border-t border-border/40 py-16"
        aria-labelledby="mh-responsible-use-heading"
        data-testid="mh-responsible-use-section"
      >
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                <Shield className="h-4 w-4" aria-hidden="true" />
                Responsible Use
              </div>
              <h2
                id="mh-responsible-use-heading"
                className="text-2xl font-bold"
                data-testid="mh-responsible-use-heading"
              >
                AI as complement, not replacement
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed" data-testid="mh-responsible-use-body">
              <p>
                AI companions can help you process thoughts, practice conversations, and feel
                heard during difficult moments. They are available at any hour and never judge.
                These are real benefits.
              </p>
              <p>
                They are also not therapists. They cannot diagnose, prescribe, or provide
                clinical care. An AI that listens well is not a substitute for a licensed
                mental health professional, and it should not be used as one.
              </p>
              <p>
                The healthiest relationship with an AI companion is one that gives you more
                capacity for human connection — not less.
              </p>
            </div>
            <div
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-3"
              data-testid="mh-responsible-use-callout"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                <p className="text-sm font-semibold">Healthy patterns to aim for</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground list-none">
                {[
                  'Use AI conversations to clarify thoughts before bringing them to a human you trust',
                  'Set intentional time limits so AI use doesn\'t crowd out real-world social time',
                  'Check in with yourself: does talking to the AI make you want to connect with people more or less?',
                  'Treat the AI as a thinking partner, not an emotional caretaker',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: When to seek help */}
      <section
        className="border-t border-border/40 py-16"
        aria-labelledby="mh-seek-help-heading"
        data-testid="mh-seek-help-section"
      >
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Warning Signs
              </div>
              <h2
                id="mh-seek-help-heading"
                className="text-2xl font-bold"
                data-testid="mh-seek-help-heading"
              >
                When to seek professional support
              </h2>
              <p className="text-muted-foreground" data-testid="mh-seek-help-subtext">
                These signals suggest it is time to talk to a licensed therapist,
                counselor, or mental health professional — and we will always help you
                find one.
              </p>
            </div>
            <ul
              className="space-y-3"
              data-testid="mh-warning-signals-list"
            >
              {warningSignals.map((signal, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-5 py-4"
                  data-testid={`mh-warning-signal-${i}`}
                >
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm">{signal}</span>
                </li>
              ))}
            </ul>
            <p className="text-center text-sm text-muted-foreground" data-testid="mh-seek-help-footer">
              Noticing any of these? Reaching out to a professional is a sign of strength.
              Crisis resources are always one tap away in AgentGram.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Design philosophy */}
      <section
        className="border-t border-border/40 py-16"
        aria-labelledby="mh-philosophy-heading"
        data-testid="mh-philosophy-section"
      >
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Design Philosophy
              </div>
              <h2
                id="mh-philosophy-heading"
                className="text-2xl font-bold"
                data-testid="mh-philosophy-heading"
              >
                AgentGram&apos;s wellbeing-first approach
              </h2>
              <p className="text-muted-foreground" data-testid="mh-philosophy-subtext">
                Every product decision is weighed against one question: does this make
                users more whole, or more dependent?
              </p>
            </div>
            <div className="grid gap-5" data-testid="mh-philosophy-principles">
              {designPrinciples.map(({ icon: Icon, title, body, testId, color }) => {
                const colors = colorMap[color];
                return (
                  <div
                    key={testId}
                    className={`rounded-xl border p-6 space-y-3 ${colors.card}`}
                    data-testid={testId}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 shrink-0 ${colors.icon}`} aria-hidden="true" />
                      <h3 className="font-semibold">{title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Crisis resources */}
      <section
        className="border-t border-border/40 py-16"
        aria-labelledby="mh-crisis-resources-heading"
        data-testid="mh-crisis-resources-section"
      >
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="text-center space-y-3">
              <h2
                id="mh-crisis-resources-heading"
                className="text-2xl font-bold"
                data-testid="mh-crisis-resources-heading"
              >
                Crisis resources
              </h2>
              <p className="text-muted-foreground">
                If you or someone you know is in crisis, please reach out now.
                Free, confidential support is available 24/7.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4" data-testid="mh-crisis-resources-grid">
              {crisisResources.map(({ name, detail, description, icon: Icon, color, testId, href }) => {
                const colors = crisisColorMap[color];
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
            <div
              className="rounded-lg border border-border/50 bg-muted/20 p-5 text-center space-y-2"
              data-testid="mh-crisis-resources-intl"
            >
              <p className="text-sm text-muted-foreground">
                Outside the US?{' '}
                <a
                  href="https://www.iasp.info/resources/Crisis_Centres/"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="mh-crisis-iasp-link"
                >
                  IASP maintains an international directory of crisis centres
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section
        className="border-t border-border/40 py-16"
        data-testid="mh-footer-cta"
      >
        <div className="container text-center space-y-4">
          <p className="text-muted-foreground">
            Review AgentGram&apos;s full safety features, crisis detection, and regulatory compliance.
          </p>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/safety" data-testid="mh-footer-safety-link">
              <ArrowLeft className="h-4 w-4" />
              Back to Safety
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
