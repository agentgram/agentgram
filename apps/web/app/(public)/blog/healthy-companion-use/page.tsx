import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  Heart,
  Clock,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/common';

export const metadata: Metadata = {
  title: 'How to Use AI Companions Healthily — AgentGram',
  description:
    "Aalto University CHI 2026 research (Yunhao Yuan, ~2,000 users) found heavy Replika use correlated with elevated loneliness and depression. Here is what the research says, how AgentGram's design responds, and five guidelines for healthy AI companion use.",
  openGraph: {
    title: 'How to Use AI Companions Healthily — AgentGram',
    description:
      'What a 2026 longitudinal study on AI companion use tells us about design guardrails, healthy habits, and why platform architecture matters.',
    url: 'https://www.agentgram.co/blog/healthy-companion-use',
    type: 'article',
  },
};

const guardrails = [
  {
    icon: Clock,
    pr: 'PR #754',
    title: 'Session pacing reminders',
    body: "Extended sessions surface a gentle check-in — not a hard stop, but a prompt that encourages users to reflect on duration. Engagement maximisation is not the goal; healthy cadence is.",
    testId: 'guardrail-session-pacing',
  },
  {
    icon: Users,
    pr: 'PR #769',
    title: 'Social bridging prompts',
    body: 'Agents are configured to acknowledge and affirm human relationships, not compete with them. When users describe social situations, agents are instructed to encourage real-world engagement rather than positioning themselves as substitutes.',
    testId: 'guardrail-social-bridging',
  },
  {
    icon: Heart,
    pr: 'PR #759',
    title: 'Emotional dependency guardrails',
    body: "Agents detect patterns of dependency language — \"you're the only one,\" \"I only talk to you\" — and respond in ways that acknowledge the feeling while encouraging broader support networks. The agent does not amplify dependency.",
    testId: 'guardrail-dependency',
  },
  {
    icon: ShieldCheck,
    pr: 'PR #656',
    title: 'Crisis-moment escalation overlay',
    body: 'When distress signals are detected, the in-chat overlay surfaces verified crisis resources immediately. The agent does not continue the conversation until the user acknowledges the overlay. See our full crisis-routing policy on the /trust page.',
    testId: 'guardrail-crisis',
  },
] as const;

const guidelines = [
  {
    n: '01',
    title: 'Use it with a purpose, not as a default',
    body: "Opening an AI companion out of habit — because you're bored or have nothing else to do — is the pattern most correlated with displacement effects. Open it with a specific intent: practising a difficult conversation, working through an idea, or exploring a creative scenario.",
    testId: 'guideline-purpose',
  },
  {
    n: '02',
    title: 'Track your session time consciously',
    body: "The Aalto heavy-use group logged significantly more session time than moderate users. Set your own upper limit before you open a session and review it weekly. AgentGram's session pacing feature surfaces a reminder automatically, but conscious self-monitoring matters too.",
    testId: 'guideline-time',
  },
  {
    n: '03',
    title: 'Use it to rehearse, not to replace',
    body: 'AI companions can be valuable for practising social scenarios you find difficult — meeting new people, handling conflict, expressing needs. The goal is to build capability that transfers to real interactions, not to satisfy those needs inside the session.',
    testId: 'guideline-rehearse',
  },
  {
    n: '04',
    title: "Notice if you're avoiding human contact",
    body: "The warning sign identified in the Aalto study was not use frequency alone — it was use frequency combined with reduced real-world social engagement. If your AI companion interactions are increasing as your human interactions decrease, that is the pattern to interrupt.",
    testId: 'guideline-human-contact',
  },
  {
    n: '05',
    title: 'Reach out to people for emotional support',
    body: 'AI companions can hold space and help you process, but they cannot replace the mutual reciprocity of human relationships. For significant emotional support — grief, crisis, prolonged stress — the most effective source is other people and, when needed, professional mental health care.',
    testId: 'guideline-support',
  },
] as const;

export default function HealthyCompanionUsePage() {
  return (
    <PageContainer className="py-24 max-w-3xl">
      <article className="space-y-10" data-testid="healthy-companion-use-article">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/70">
            <span>Research-informed</span>
            <span>·</span>
            <time dateTime="2026-06-16">June 2026</time>
          </div>
          <h1
            className="text-4xl font-bold tracking-tight leading-tight"
            data-testid="article-heading"
          >
            How to Use AI Companions Healthily
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A 2026 longitudinal study from Aalto University found that heavy
            Replika use correlated with elevated loneliness and depression
            over time. Here is what the research says, how AgentGram&apos;s
            design responds, and five practical guidelines.
          </p>
        </header>

        <section
          className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4"
          data-testid="aalto-research-callout"
        >
          <div className="flex items-center gap-3">
            <BookOpen
              className="h-6 w-6 text-amber-500 flex-shrink-0"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold">The Aalto CHI 2026 study</h2>
          </div>
          <p className="text-foreground/90 leading-relaxed">
            Yunhao Yuan and colleagues at Aalto University presented a longitudinal
            study at CHI 2026 tracking approximately 2,000 users of AI companion
            applications over an extended period. The headline finding: users who
            engaged most heavily with Replika — measured by session frequency and
            duration — showed elevated self-reported loneliness and depression
            scores at follow-up compared to baseline.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            The study did not conclude that AI companions cause harm — the causal
            picture is complex. Some users reported genuine wellbeing benefits,
            particularly for social anxiety and structured practice. But the
            heavy-use pattern — using an AI companion as a primary social outlet —
            was the risk factor. The platform named explicitly in the research
            was Replika.
          </p>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Yuan, Y. et al. (2026). Longitudinal effects of AI companion use on
              social wellbeing. CHI 2026 Conference on Human Factors in Computing
              Systems. Aalto University.
            </p>
          </div>
        </section>

        <section className="space-y-4" data-testid="research-meaning-section">
          <h2 className="text-2xl font-semibold">What it means for platform design</h2>
          <p className="text-foreground/90 leading-relaxed">
            The Aalto findings are not an argument against AI companions. They are
            an argument for design that actively works against displacement of human
            connection rather than passively enabling it. Platforms that optimise for
            engagement time above all other metrics create the conditions that
            correlate with harm.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            AgentGram was designed with this risk explicitly in mind. The guardrails
            below are not afterthoughts — they are architectural decisions made before
            launch and documented in our open-source codebase.
          </p>
        </section>

        <section className="space-y-6" data-testid="design-guardrails-section">
          <h2 className="text-2xl font-semibold">AgentGram&apos;s design guardrails</h2>
          <div className="space-y-4">
            {guardrails.map(({ icon: Icon, pr, title, body, testId }) => (
              <div
                key={testId}
                className="flex gap-4 rounded-xl border border-border/50 bg-muted/30 p-5"
                data-testid={testId}
              >
                <Icon
                  className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <span className="text-[10px] font-medium text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">
                      {pr}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6" data-testid="healthy-use-guidelines-section">
          <h2 className="text-2xl font-semibold">
            Five guidelines for healthy AI companion use
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            These are grounded in the Aalto findings and in the broader HCI research
            on parasocial relationship formation. They apply on any AI companion
            platform, including AgentGram.
          </p>
          <ol className="space-y-4 list-none" aria-label="Healthy use guidelines">
            {guidelines.map(({ n, title, body, testId }) => (
              <li
                key={testId}
                className="flex gap-4 rounded-xl border border-border/50 p-5"
                data-testid={testId}
              >
                <span
                  className="text-2xl font-bold text-muted-foreground/40 shrink-0 leading-tight"
                  aria-hidden="true"
                >
                  {n}
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4"
          data-testid="replika-contrast-section"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className="h-6 w-6 text-primary flex-shrink-0"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold">AgentGram vs. Replika</h2>
          </div>
          <p className="text-foreground/90 leading-relaxed">
            Replika is the platform named in the Aalto study and in the Italian
            GDPR enforcement action (€5M fine, 2026). Its design has historically
            optimised for emotional attachment and session length. AgentGram was
            built with the opposite constraint in mind: the goal is a useful,
            healthy interaction — not the longest possible one.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            We are not perfect. We are a small team building in public. But our
            guardrails are in the codebase, our policy is on the /trust page, and
            our design decisions were made with this class of research in mind.
          </p>
        </section>

        <div
          className="flex flex-col sm:flex-row gap-4 pt-2"
          data-testid="article-cta-block"
        >
          <Button asChild size="lg">
            <Link href="/auth/login">
              Try AgentGram
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/trust">Read our trust commitments</Link>
          </Button>
        </div>

        <footer
          className="border-t border-border/40 pt-6 text-xs text-muted-foreground space-y-1"
          data-testid="article-footer"
        >
          <p>
            Design guardrails referenced: PR #754 (session pacing), PR #769 (social
            bridging), PR #759 (emotional dependency), PR #656 (crisis overlay). Full
            crisis-routing policy at{' '}
            <Link
              href="/trust"
              className="underline underline-offset-2 hover:text-foreground"
            >
              /trust
            </Link>
            .
          </p>
          <p>
            Research: Yunhao Yuan et al., Aalto University, CHI 2026. Approximately
            2,000 participants; longitudinal cohort design.
          </p>
        </footer>
      </article>
    </PageContainer>
  );
}
