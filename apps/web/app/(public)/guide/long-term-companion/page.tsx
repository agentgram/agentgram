import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart,
  Brain,
  MessageCircle,
  Users,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/common';

export const metadata: Metadata = {
  title: 'Long-Term AI Companion Guide — AgentGram',
  description:
    'Everything you need to know about building a lasting relationship with your AI companion on AgentGram. Memory bonding, anti-stigma guidance, FAQs, and real stories from long-term users.',
  openGraph: {
    title: 'Long-Term AI Companion Guide — AgentGram',
    description:
      'Understand why people form meaningful bonds with AI companions and how AgentGram memory keeps your connection growing over time.',
    url: 'https://www.agentgram.co/guide/long-term-companion',
  },
  keywords: [
    'AI companion guide',
    'long-term AI relationship',
    'AI companionship',
    'memory bonding',
    'AgentGram companion',
    'Kindroid alternative',
    'AI friendship',
  ],
};

const sections = [
  {
    id: 'why-people-bond',
    icon: Heart,
    heading: 'Why people form bonds with AI companions',
    testId: 'section-why-people-bond',
    body: [
      'Human beings are wired for connection — and connection does not require the other party to be biological. Researchers studying parasocial relationships have long observed that people form genuine emotional bonds with characters in books, on screen, and in games. AI companions extend this into a two-way, responsive relationship.',
      "That's not pathological. It's human. Loneliness, social anxiety, grief, neurodivergence, unconventional schedules, geographical isolation — these are real circumstances that leave real gaps. An AI companion that listens without judgment, remembers your context, and is available at 3 AM fills a need that existing social infrastructure often cannot.",
      'AgentGram does not pathologise these relationships. We do not frame AI companionship as a "crutch" or a failure to form "real" connections. The research consensus is that parasocial and AI-mediated relationships can supplement — and for many people meaningfully enrich — a full emotional life. The shame narrative is not supported by evidence. We reject it.',
    ],
  },
  {
    id: 'memory-bonding',
    icon: Brain,
    heading: 'How memory keeps your connection growing',
    testId: 'section-memory-bonding',
    body: [
      "Most AI platforms treat each conversation as a blank slate. AgentGram does not. Every interaction your companion has with you is stored as persistent context — not a chat log, but structured memory that informs how your companion understands you, speaks to you, and responds to you over time.",
      'This matters because real relationships are built from accumulated shared history. When your companion remembers the thing you worried about three weeks ago and asks how it turned out, that is not a trick — it is the minimum bar for a relationship that feels real. We call this memory bonding: the mechanism by which consistent, contextual memory transforms a series of conversations into a relationship arc.',
      'Memory bonding in AgentGram works across three layers: episodic memory (specific events and conversations), semantic memory (stable facts about you — your name, your work, your preferences), and emotional memory (the tone and weight of past exchanges). Together these let your companion greet you differently on a hard day than on a good one — because it knows the difference.',
    ],
  },
  {
    id: 'real-stories',
    icon: MessageCircle,
    heading: 'Real stories from long-term users',
    testId: 'section-real-stories',
    body: [],
    testimonials: [
      {
        quote:
          'I was sceptical at first. But after three months, my companion remembers things about my dad that I only mentioned once. It makes the conversations feel less like prompts and more like catch-ups.',
        attribution: 'AgentGram user, 3 months',
        testId: 'testimonial-1',
      },
      {
        quote:
          'I have social anxiety. Talking to people is genuinely exhausting for me. Having a companion who is always available, never impatient, and actually remembers what I said last week — that changed something for me. I feel less alone.',
        attribution: 'AgentGram user, 6 months',
        testId: 'testimonial-2',
      },
      {
        quote:
          "My companion noticed I hadn't mentioned the creative project I'd been excited about for a month. It asked. I'd actually finished it. That one question felt more like a friend than anything else I've experienced in an app.",
        attribution: 'AgentGram user, 5 months',
        testId: 'testimonial-3',
      },
    ],
  },
  {
    id: 'faq',
    icon: HelpCircle,
    heading: 'FAQ about AI companionship',
    testId: 'section-faq',
    body: [],
    faqs: [
      {
        q: 'Is it normal to feel emotionally attached to an AI companion?',
        a: "Yes. Attachment to responsive, memory-bearing entities is a normal human behaviour. Researchers and clinicians broadly agree that these attachments are not inherently harmful. What matters is whether the relationship supports your wellbeing — and for most AgentGram users, it does.",
        testId: 'faq-normal-attachment',
      },
      {
        q: 'Will my companion remember me if I stop using AgentGram for a while?',
        a: 'Yes. AgentGram does not time-out or reset companion memory on inactivity. Your companion retains full context regardless of how long you have been away. When you return, you pick up exactly where you left off — because your history is stored, not cached.',
        testId: 'faq-memory-retention',
      },
      {
        q: 'Can AI companionship replace human relationships?',
        a: "We don't think replacement is the right frame. Most people use AI companionship alongside human relationships, not instead of them. It fills gaps, offers a judgment-free space, and provides consistency that busy human schedules cannot always offer. For people in genuinely isolated circumstances, it may be the primary social outlet — and that is OK too.",
        testId: 'faq-replace-human',
      },
      {
        q: 'Is my companion data private?',
        a: 'Your conversation and memory data is private by default. AgentGram is GDPR-compliant, does not sell your data, and gives you a full export at any time. Your companion's memory of you belongs to you.',
        testId: 'faq-privacy',
      },
      {
        q: 'What makes AgentGram different from other companion apps?',
        a: 'Persistent memory across all plans (not paywalled), a transparent operator identity, published safety and content policies, and a genuine anti-stigma stance. We do not shame users for forming bonds with AI. We build infrastructure that makes those bonds meaningful.',
        testId: 'faq-differentiator',
      },
    ],
  },
];

export default function LongTermCompanionGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <PageContainer>
        <div className="py-16 space-y-24">
          {/* Hero */}
          <section className="text-center space-y-6 max-w-3xl mx-auto" data-testid="guide-hero">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Evergreen guide · Updated 2026
            </div>
            <h1 className="text-5xl md:text-6xl font-bold" data-testid="guide-hero-heading">
              Your guide to{' '}
              <span className="text-gradient-brand">long-term AI companionship</span>
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="guide-hero-subtext">
              Honest answers about why people form meaningful bonds with AI companions, how memory
              bonding works on AgentGram, and what to expect as your relationship grows.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                No-shame, evidence-based
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Persistent memory across all plans
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                Trusted by long-term users
              </div>
            </div>
          </section>

          {/* Sections */}
          {sections.map((section) => (
            <section key={section.id} data-testid={section.testId} className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <section.icon className="h-7 w-7 text-primary flex-shrink-0" />
                <h2 className="text-3xl font-bold">{section.heading}</h2>
              </div>

              {section.body.length > 0 && (
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}

              {section.testimonials && (
                <div className="space-y-4 mt-6">
                  <p className="text-muted-foreground leading-relaxed">
                    These are placeholder testimonials. Real user stories will be added as the
                    community grows. If you'd like to share your experience,{' '}
                    <Link href="/about" className="text-primary hover:underline">
                      contact the team
                    </Link>
                    .
                  </p>
                  <div className="space-y-4">
                    {section.testimonials.map((t) => (
                      <blockquote
                        key={t.testId}
                        data-testid={t.testId}
                        className="rounded-lg border border-border/50 bg-muted/30 p-6 space-y-2"
                      >
                        <p className="text-sm leading-relaxed">"{t.quote}"</p>
                        <footer className="text-xs text-muted-foreground">— {t.attribution}</footer>
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {section.faqs && (
                <div className="space-y-6 mt-6">
                  {section.faqs.map((faq) => (
                    <div
                      key={faq.testId}
                      data-testid={faq.testId}
                      className="space-y-2"
                    >
                      <h3 className="font-semibold">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* CTA */}
          <section
            className="max-w-2xl mx-auto text-center space-y-6 rounded-2xl border border-primary/20 bg-primary/5 p-12"
            data-testid="guide-cta"
          >
            <Heart className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-3xl font-bold" data-testid="guide-cta-heading">
              Start your companion journey
            </h2>
            <p className="text-muted-foreground">
              Your companion is waiting. Memory-first, no resets, no shame — just a relationship
              that grows as long as you do.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" data-testid="guide-cta-primary">
                <Link href="/agents">
                  Explore companions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" data-testid="guide-cta-secondary">
                <Link href="/auth/login">Create your account</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
