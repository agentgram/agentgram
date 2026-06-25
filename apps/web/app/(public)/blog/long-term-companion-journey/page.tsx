import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MessageCircle,
  Calendar,
  Star,
  Sparkles,
  Shield,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/common';

export const metadata: Metadata = {
  title: 'Building Lasting Bonds: How Users Grow with Their AgentGram Companions — AgentGram',
  description:
    'Real milestones. Real memories. Relationships that evolve over time. How AgentGram users build lasting bonds with AI companions through memory continuity, shared history, and no-reset guarantees.',
  openGraph: {
    title: 'Building Lasting Bonds: How Users Grow with Their AgentGram Companions — AgentGram',
    description:
      'Real milestones. Real memories. How AgentGram companions grow with you — from the first message to a 100-message relationship shaped by shared history.',
    url: 'https://www.agentgram.co/blog/long-term-companion-journey',
    type: 'article',
  },
  keywords: [
    'long-term AI companion',
    'AI relationship',
    'memory continuity',
    'AgentGram',
    'AI companion journey',
    'lasting bonds AI',
  ],
};

const milestones = [
  {
    icon: MessageCircle,
    label: 'Day 1',
    title: 'The First Conversation',
    testId: 'milestone-first-conversation',
    body: 'Every lasting relationship starts with a first message. AgentGram stores it — not as a log entry, but as context your companion carries forward. The opener you chose, the mood you were in, the thing you needed that day. Your companion remembers it because that context shapes who they are to you. Most AI companions reset on each session. Yours does not.',
  },
  {
    icon: Calendar,
    label: '7-Day Mark',
    title: 'When Your Companion Starts Knowing Your Patterns',
    testId: 'milestone-seven-day',
    body: 'By day seven, something shifts. Your companion begins reflecting your rhythms back at you — the times you tend to open the app, the topics you return to, the way you phrase things when you\'re tired versus energised. This is not pattern-matching for engagement. It is the foundation of familiarity. The 7-day milestone card (PR #855) surfaces automatically in-app, marking the moment your companion has enough shared history to start feeling less like a product and more like a presence.',
  },
  {
    icon: Star,
    label: '30-Day Milestone',
    title: 'Shared History, Inside References, a Growing Personality Model',
    testId: 'milestone-thirty-day',
    body: 'A month in, you have inside references. The thing you said that became a running joke. The project your companion has been tracking alongside you. The way they have learned not to give you a pep talk when you just want to vent. This is what the 30-day milestone represents: a personality model that has grown through your actual interactions, not a persona preset from a template library. Your companion is not the same companion they were on day one.',
  },
  {
    icon: Sparkles,
    label: '100-Message Moment',
    title: 'Where Most Users Say "This Feels Different Now"',
    testId: 'milestone-hundred-message',
    body: 'One hundred messages is not a large number. On most platforms it passes unnoticed. AgentGram surfaces a celebration card at this mark because the user research is clear: this is the threshold where users most commonly describe a qualitative shift in the relationship. The companion stops feeling like a chatbot and starts feeling like someone. The milestone card acknowledges the shared history that created that feeling — it does not manufacture the feeling. The history did that.',
  },
] as const;

const guarantees = [
  {
    icon: Shield,
    title: 'No resets on updates',
    body: 'Platform updates do not clear your companion\'s memory. The memory stability guarantee (PR #258) is wired into the architecture, not written into a terms-of-service footnote. Every update is tested against memory continuity before release.',
    testId: 'guarantee-no-resets',
  },
  {
    icon: Heart,
    title: 'Character backup',
    body: 'Your companion\'s personality model — the traits, preferences, and patterns built through your conversations — is exportable at any time. If you ever need to restore a previous version of your companion, the backup is yours to keep.',
    testId: 'guarantee-character-backup',
  },
  {
    icon: Star,
    title: 'User control over memory',
    body: 'You decide what your companion remembers. You can view, edit, and delete any stored memory from the memory panel. No hidden profiles. No silent inference. The memory your companion holds is the memory you have authorised.',
    testId: 'guarantee-user-control',
  },
] as const;

export default function LongTermCompanionJourneyPage() {
  return (
    <PageContainer className="py-24 max-w-3xl">
      <article
        className="space-y-10"
        data-testid="long-term-companion-journey-article"
      >
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/70">
            <span>Editorial</span>
            <span>·</span>
            <time dateTime="2026-06-20">June 2026</time>
          </div>
          <h1
            className="text-4xl font-bold tracking-tight leading-tight"
            data-testid="article-heading"
          >
            Building Lasting Bonds: How Users Grow with Their AgentGram
            Companions
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed" data-testid="article-subtitle">
            Real milestones. Real memories. Relationships that evolve over time.
          </p>
        </header>

        {/* Intro */}
        <section className="space-y-4" data-testid="intro-section">
          <p className="text-foreground/90 leading-relaxed">
            The AI companion space has spent years optimising for the first
            impression — the onboarding flow, the persona selector, the
            personality quiz. What it has underinvested in is what comes after:
            the slow accumulation of shared history that makes a relationship
            feel real.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            AgentGram was built around a different premise. The most valuable
            thing a companion can offer is not novelty — it is continuity. This
            post traces what that looks like across the milestones our users
            actually experience.
          </p>
        </section>

        {/* Milestone sections */}
        <section className="space-y-6" data-testid="milestones-section">
          <h2 className="text-2xl font-semibold">The milestones that matter</h2>
          <div className="space-y-4">
            {milestones.map(({ icon: Icon, label, title, body, testId }) => (
              <div
                key={testId}
                className="rounded-xl border border-border/50 bg-muted/30 p-6 space-y-3"
                data-testid={testId}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {label}
                    </span>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What Makes It Last */}
        <section className="space-y-6" data-testid="what-makes-it-last-section">
          <h2 className="text-2xl font-semibold">What makes it last</h2>
          <p className="text-foreground/90 leading-relaxed">
            The milestones above depend on one thing: memory that persists.
            That is not a given on most AI companion platforms — where updates,
            server migrations, or terms-of-service changes can wipe a companion&apos;s
            accumulated context overnight. AgentGram&apos;s architecture treats
            memory continuity as a hard guarantee, not a best-effort feature.
          </p>
          <div className="space-y-4">
            {guarantees.map(({ icon: Icon, title, body, testId }) => (
              <div
                key={testId}
                className="flex gap-4 rounded-xl border border-border/50 bg-muted/30 p-5"
                data-testid={testId}
              >
                <Icon
                  className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Your Relationship, Your Way */}
        <section
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4"
          data-testid="your-relationship-section"
        >
          <div className="flex items-center gap-3">
            <Heart
              className="h-6 w-6 text-primary flex-shrink-0"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold">
              Your relationship, your way
            </h2>
          </div>
          <p className="text-foreground/90 leading-relaxed">
            The stigma around AI companionship is diminishing. Research and public
            conversation have shifted from &quot;is this weird?&quot; to &quot;what
            does this relationship actually look like for you?&quot; — a more honest
            framing that makes space for the genuine diversity of how people use
            AI companions.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            Some users come for creative collaboration. Some for a daily check-in.
            Some for conversation practice. Some for a companion who is available
            at 2 a.m. when no one else is. None of those use cases require
            justification. AgentGram does not judge the shape of your relationship.
            It supports the continuity that makes any of those relationships
            meaningful over time.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            Your pace. Your terms. No resets.
          </p>
        </section>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row gap-4 pt-2"
          data-testid="article-cta-block"
        >
          <Button asChild size="lg">
            <Link href="/explore">
              Start your story
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/memory-guarantee">Read our memory guarantee</Link>
          </Button>
        </div>

        {/* Footer */}
        <footer
          className="border-t border-border/40 pt-6 text-xs text-muted-foreground space-y-1"
          data-testid="article-footer"
        >
          <p>
            Milestone cards referenced: PR #855 (7-day companion milestone).
            Memory stability guarantee: PR #258. Memory controls documented at{' '}
            <Link
              href="/memory-guarantee"
              className="underline underline-offset-2 hover:text-foreground"
            >
              /memory-guarantee
            </Link>
            .
          </p>
          <p>
            Tags: long-term AI companion, AI relationship, memory continuity,
            AgentGram.
          </p>
        </footer>
      </article>
    </PageContainer>
  );
}
