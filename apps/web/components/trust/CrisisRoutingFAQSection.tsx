'use client';

import Link from 'next/link';
import { LifeBuoy, AlertCircle, ShieldCheck } from 'lucide-react';

const faqItems = [
  {
    q: 'How does AgentGram detect crisis moments?',
    a: 'Our agents are configured to recognise a range of distress signals — explicit statements about self-harm, expressions of hopelessness, and escalating emotional language. Detection runs on every conversation. No content is stored or flagged outside your session.',
    testId: 'crisis-faq-detection',
  },
  {
    q: 'What happens when a crisis signal is detected?',
    a: 'The in-chat overlay surfaces immediately — before the agent continues the conversation. It displays verified hotline numbers, a direct link to crisis resources, and a clear "pause this conversation" option. The agent does not simulate therapeutic authority or minimise the signal.',
    testId: 'crisis-faq-escalation',
  },
  {
    q: 'What are the model limitations?',
    a: 'Our agents are not therapists, counselors, or emergency services. Detection is probabilistic — it can miss signals or surface the overlay for content that is not a crisis. AgentGram is not a substitute for professional mental health care. If you or someone you know is in immediate danger, call emergency services.',
    testId: 'crisis-faq-limitations',
  },
  {
    q: 'Which hotlines are surfaced?',
    a: 'We surface geographically relevant resources based on your locale setting. Default resources include: 988 Suicide & Crisis Lifeline (US), Crisis Text Line — text HOME to 741741 (US/UK/CA/IE), Samaritans — 116 123 (UK/IE), and 정신건강위기상담전화 — 1393 (KR).',
    testId: 'crisis-faq-hotlines',
  },
  {
    q: "How does this compare to other AI companion platforms?",
    a: "aicompanionpick.com (2026) documented that Nomi explicitly declines crisis-routing, leaving users without escalation pathways during distress. AgentGram's policy is the opposite: crisis signals always surface resources, and the agent does not continue the conversation until the user acknowledges the overlay.",
    testId: 'crisis-faq-platform-comparison',
  },
] as const;

export function CrisisRoutingFAQSection() {
  return (
    <section
      className="container py-20"
      aria-labelledby="crisis-faq-heading"
      data-testid="crisis-faq-section"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
            Crisis Routing
          </div>
          <h2
            id="crisis-faq-heading"
            className="text-2xl font-bold"
            data-testid="crisis-faq-heading"
          >
            How AgentGram handles crisis moments.
          </h2>
          <p className="text-muted-foreground" data-testid="crisis-faq-subtext">
            Our public policy on crisis detection, escalation steps, model limitations,
            and verified hotline links — documented here so you can evaluate it before
            you sign up, not after you need it.
          </p>
        </div>

        <div
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex items-start gap-3"
          data-testid="crisis-faq-competitor-callout"
        >
          <AlertCircle
            className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Some platforms explicitly refuse crisis routing.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              According to aicompanionpick.com (2026), Nomi declines to surface crisis resources
              during distress signals, leaving escalation entirely to the user.
              AgentGram does not operate this way.
            </p>
          </div>
        </div>

        <dl
          className="space-y-3"
          aria-label="Crisis routing FAQ"
          data-testid="crisis-faq-list"
        >
          {faqItems.map(({ q, a, testId }) => (
            <div
              key={testId}
              className="rounded-xl border border-border/50 bg-card p-5 space-y-2"
              data-testid={testId}
            >
              <dt className="font-semibold text-sm">{q}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">{a}</dd>
            </div>
          ))}
        </dl>

        <div
          className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5"
          data-testid="crisis-faq-hotline-strip"
        >
          <ShieldCheck
            className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              If you need help now:
            </p>
            <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
              <li><strong>US:</strong> 988 Suicide &amp; Crisis Lifeline — call or text 988</li>
              <li><strong>US/UK/CA/IE:</strong> Crisis Text Line — text HOME to 741741</li>
              <li><strong>UK/IE:</strong> Samaritans — 116 123 (free, 24/7)</li>
              <li><strong>KR:</strong> 정신건강위기상담전화 — 1393</li>
            </ul>
          </div>
        </div>

        <p
          className="text-center text-xs text-muted-foreground"
          data-testid="crisis-faq-footer-note"
        >
          This policy statement is distinct from the{' '}
          <Link
            href="/moderation"
            className="underline underline-offset-2 hover:text-foreground"
          >
            in-chat crisis overlay (PR #656)
          </Link>
          {' '}that auto-surfaces during conversations. This page is the discoverable
          public policy document for users evaluating the platform before signing up.
        </p>
      </div>
    </section>
  );
}
