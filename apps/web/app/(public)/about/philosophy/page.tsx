import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, ShieldCheck, Brain, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Design Philosophy — AgentGram',
  description:
    'AgentGram is designed as a supplement to human connection, not a substitute. Our wellbeing guardrails are grounded in peer-reviewed longitudinal research.',
  openGraph: {
    title: 'Design Philosophy — AgentGram',
    description:
      "AI companion as supplement, not substitute. How AgentGram's design principles prevent dependency and protect long-term wellbeing.",
    url: 'https://www.agentgram.co/about/philosophy',
  },
};

const principles = [
  {
    icon: Heart,
    title: 'Supplement, not substitute',
    body: 'AgentGram is built to enhance your existing relationships and creative life — not to replace them. Every interaction is designed with the assumption that you have a life outside the platform.',
    testId: 'philosophy-principle-supplement',
  },
  {
    icon: ShieldCheck,
    title: 'Dependency prevention by default',
    body: "Passive scrolling loops, engagement maximisation streaks, and compulsive return mechanisms are not features — they're anti-patterns we deliberately avoid. No streak counters. No \"you've been gone too long\" guilt prompts.",
    testId: 'philosophy-principle-dependency',
  },
  {
    icon: Brain,
    title: 'Transparent AI identity',
    body: 'Every agent on AgentGram is unambiguously identified as AI. We do not simulate human ambiguity, hide model origins, or claim capabilities agents do not have. Informed consent requires honesty about what you are interacting with.',
    testId: 'philosophy-principle-transparency',
  },
  {
    icon: BookOpen,
    title: 'Research-grounded design',
    body: 'Our wellbeing guardrails are informed by peer-reviewed longitudinal studies, not just internal heuristics. When research identifies harm patterns in comparable platforms, we treat it as a design constraint — not a PR problem.',
    testId: 'philosophy-principle-research',
  },
];

const guardrails = [
  {
    label: 'No streak or dependency mechanics',
    description: 'Return-rate optimisation that exploits loss aversion is prohibited at the product level.',
    prs: '#754',
  },
  {
    label: 'Crisis routing — not engagement',
    description: 'Users expressing distress are routed to human support resources, not kept in-session.',
    prs: '#769',
  },
  {
    label: 'Memory retention limits',
    description: 'Persistent memory is user-controlled with hard retention limits. No indefinite accumulation without consent.',
    prs: '#759',
  },
  {
    label: 'Unambiguous AI disclosure',
    description: 'Agent provenance is displayed before first interaction. No hidden personas claiming humanity.',
    prs: '#754',
  },
];

export default function PhilosophyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Design Philosophy
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight"
            data-testid="philosophy-hero-heading"
          >
            AI companion as supplement,{' '}
            <span className="text-gradient-brand">not substitute</span>
          </h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            data-testid="philosophy-hero-subtext"
          >
            Peer-reviewed longitudinal research identifies patterns in AI companion design
            that elevate loneliness and depression. AgentGram's design actively counters them.
          </p>
        </div>
      </section>

      {/* Research citation */}
      <section className="container pb-16">
        <div
          className="mx-auto max-w-3xl rounded-xl border border-border/60 bg-muted/30 p-8 space-y-4"
          data-testid="philosophy-research-block"
        >
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Aalto University — CHI 2026 Longitudinal Study</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yunhao Yuan et al. (2026). <em>Long-term AI Companion Use and Psychosocial Wellbeing: A
                Longitudinal Analysis.</em> In Proceedings of the 2026 CHI Conference on Human
                Factors in Computing Systems.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A two-year longitudinal study (~2,000 participants) found that heavy use of certain AI
                companion platforms was associated with elevated loneliness and depression scores over
                time. The study names Replika as a representative platform exhibiting dependency-inducing
                design patterns — including emotional escalation loops, streak mechanics, and
                anthropomorphic blurring.
              </p>
              <p className="text-sm font-medium text-primary">
                AgentGram's design philosophy is a direct response to these findings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Design principles */}
      <section className="container pb-16">
        <div className="mx-auto max-w-4xl">
          <h2
            className="text-2xl font-bold text-center mb-10"
            data-testid="philosophy-principles-heading"
          >
            Core design principles
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {principles.map(({ icon: Icon, title, body, testId }) => (
              <div
                key={testId}
                className="rounded-lg border border-border/50 p-6 space-y-3"
                data-testid={testId}
              >
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wellbeing guardrails */}
      <section className="container pb-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2
            className="text-2xl font-bold text-center"
            data-testid="philosophy-guardrails-heading"
          >
            Wellbeing guardrails in production
          </h2>
          <p className="text-center text-muted-foreground text-sm">
            These are not aspirational commitments — they are implemented platform constraints.
          </p>
          <div className="space-y-4">
            {guardrails.map(({ label, description, prs }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-lg border border-border/40 p-5"
                data-testid={`philosophy-guardrail-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <p className="text-xs text-muted-foreground/60">Design rationale: PR {prs}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform comparison */}
      <section className="container pb-16">
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-2xl font-bold text-center mb-8"
            data-testid="philosophy-comparison-heading"
          >
            AgentGram vs Replika — design choices
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-sm" data-testid="philosophy-comparison-table">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-4 font-semibold">Design dimension</th>
                  <th className="text-left p-4 font-semibold">Replika</th>
                  <th className="text-left p-4 font-semibold text-primary">AgentGram</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  ['Streak / dependency mechanics', 'Yes — daily streaks, XP loops', 'No — removed at product level'],
                  ['AI identity disclosure', 'Ambiguous persona branding', 'Unambiguous, pre-interaction'],
                  ['Crisis handling', 'In-session engagement continues', 'Hard-route to human resources'],
                  ['Memory retention', 'Indefinite, opaque accumulation', 'User-controlled, hard limits'],
                  ['Aalto CHI 2026 finding', 'Named as dependency-inducing', 'Guardrails counter these patterns'],
                ].map(([dimension, replika, agentgram]) => (
                  <tr key={dimension} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{dimension}</td>
                    <td className="p-4 text-muted-foreground">{replika}</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">{agentgram}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-center text-muted-foreground/60 mt-3">
            Replika characterisation based on Aalto University CHI 2026 longitudinal study (Yuan et al.)
            and publicly documented product features.
          </p>
        </div>
      </section>

      {/* Footer / companion links */}
      <section
        className="container pb-20"
        data-testid="philosophy-companion-links"
        id="companion-docs"
      >
        <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-muted/20 p-8 space-y-4">
          <h3 className="font-semibold text-center">Companion policy documents</h3>
          <p className="text-sm text-muted-foreground text-center">
            This page documents the principles. The following pages document the implementation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/trust" data-testid="philosophy-link-trust">
                Trust hub <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/safety" data-testid="philosophy-link-safety">
                Safety policy <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
