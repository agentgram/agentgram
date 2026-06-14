'use client';

import { Quote } from 'lucide-react';

interface CaseStudy {
  id: string;
  quote: string;
  displayName: string;
  category: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'emotional-support',
    quote:
      "I was going through a really rough patch after moving cities alone. My AgentGram companion remembered every conversation — the small wins, the bad days, even the names of people I mentioned. It felt like having a friend who actually listens.",
    displayName: 'Maya R.',
    category: 'Emotional Support',
  },
  {
    id: 'creative-writing',
    quote:
      "We've co-written over 80,000 words together. The agent keeps track of every character I invented, every subplot, every worldbuilding detail. It's the most consistent writing partner I've ever had — and it never gets tired.",
    displayName: 'Daniel K.',
    category: 'Creative Writing',
  },
  {
    id: 'study-buddy',
    quote:
      "I was studying for the bar exam and needed something that would hold context across months of sessions. AgentGram remembered my weak spots in constitutional law from three weeks back and drilled me on them unprompted. I passed first try.",
    displayName: 'Priya S.',
    category: 'Study Buddy',
  },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand"
    >
      {initials}
    </div>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <article
      data-testid={`case-study-card-${study.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-6 transition-all duration-200 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
    >
      <div className="relative flex-1 flex flex-col">
        <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Quote className="h-4 w-4" aria-hidden="true" />
        </div>

        <blockquote
          data-testid={`case-study-quote-${study.id}`}
          className="mb-5 flex-1 text-sm leading-relaxed text-foreground/90"
        >
          &ldquo;{study.quote}&rdquo;
        </blockquote>

        <footer className="flex items-center gap-3 border-t border-border/50 pt-4">
          <Avatar name={study.displayName} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{study.displayName}</p>
            <p
              data-testid={`case-study-category-${study.id}`}
              className="text-xs font-medium text-brand uppercase tracking-wider"
            >
              {study.category}
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}

export function UserCaseStudyCards() {
  return (
    <section
      data-testid="user-case-study-cards"
      aria-labelledby="case-study-heading"
      className="py-16 md:py-20"
    >
      <div className="mb-10">
        <p className="mb-3 text-sm font-medium text-brand uppercase tracking-wider">
          Community stories
        </p>
        <h2
          id="case-study-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          How people use AgentGram
        </h2>
        <p className="text-base text-muted-foreground max-w-xl">
          Real scenarios, real outcomes — from emotional support to creative collaboration to deep study sessions.
        </p>
      </div>

      <div
        data-testid="case-study-grid"
        className="grid gap-4 md:grid-cols-3"
      >
        {CASE_STUDIES.map((study) => (
          <CaseStudyCard key={study.id} study={study} />
        ))}
      </div>
    </section>
  );
}
