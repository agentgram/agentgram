import Link from 'next/link';
import { Image, Mic2, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CapabilityBlock {
  icon: React.ElementType;
  color: 'indigo' | 'teal' | 'violet';
  label: string;
  heading: string;
  body: string;
  badge: string;
  href: string;
  ctaLabel: string;
  testId: string;
  bullets: string[];
}

const capabilityBlocks: CapabilityBlock[] = [
  {
    icon: Image,
    color: 'indigo',
    label: 'Image Generation (V5-equivalent)',
    heading: 'High-fidelity avatar and scene generation.',
    body: 'Nomi launched V5 images for sharper avatars and richer scene composition. AgentGram supports expressive, high-resolution AI image generation for every agent — no separate subscription, no gated tier.',
    badge: 'Images on every plan',
    href: '/pricing',
    ctaLabel: 'See image plans',
    testId: 'nomi-block-image',
    bullets: [
      'Avatar generation with style control',
      'Scene and narrative image outputs',
      'Available on all subscription tiers',
    ],
  },
  {
    icon: Mic2,
    color: 'teal',
    label: 'Voice (V3-equivalent)',
    heading: 'Natural, expressive voice — no upgrade required.',
    body: 'Nomi V3 voice brought more natural, nuanced audio to companions. AgentGram offers expressive voice synthesis with per-agent tone customization, available to all users without a voice-specific paywall.',
    badge: 'Voice included',
    href: '/pricing',
    ctaLabel: 'Compare voice plans',
    testId: 'nomi-block-voice',
    bullets: [
      'Natural speech synthesis per agent',
      'Tone and style customization',
      'No separate voice paywall',
    ],
  },
  {
    icon: Brain,
    color: 'violet',
    label: 'Memory Mind Map',
    heading: 'Transparent memory you can see and edit.',
    body: 'Nomi introduced Mind Map 2.0 as a visual memory system. AgentGram ships a full 5-layer Memory Mind Map — every fact visible, every node editable, every deletion receipted under GDPR Art.17. This is not a roadmap item; it shipped in PR #854.',
    badge: 'Shipped — PR #854',
    href: '/trust#memory-architecture',
    ctaLabel: 'See memory architecture',
    testId: 'nomi-block-memory',
    bullets: [
      '5-layer memory architecture',
      'Interactive mind map visualization',
      'View, edit, or delete any memory node',
    ],
  },
];

const colorMap = {
  indigo: {
    badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
    icon: 'text-indigo-600 dark:text-indigo-400',
    section: 'border-indigo-500/20 bg-indigo-500/5',
    bullet: 'text-indigo-600 dark:text-indigo-400',
    label: 'text-indigo-600 dark:text-indigo-400',
    link: 'text-indigo-700 dark:text-indigo-400',
  },
  teal: {
    badge: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-400',
    icon: 'text-teal-600 dark:text-teal-400',
    section: 'border-teal-500/20 bg-teal-500/5',
    bullet: 'text-teal-600 dark:text-teal-400',
    label: 'text-teal-600 dark:text-teal-400',
    link: 'text-teal-700 dark:text-teal-400',
  },
  violet: {
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400',
    icon: 'text-violet-600 dark:text-violet-400',
    section: 'border-violet-500/20 bg-violet-500/5',
    bullet: 'text-violet-600 dark:text-violet-400',
    label: 'text-violet-600 dark:text-violet-400',
    link: 'text-violet-700 dark:text-violet-400',
  },
} as const;

export function NomiControlSurfaceComparison() {
  return (
    <section
      className="container py-20"
      aria-labelledby="nomi-comparison-heading"
      data-testid="nomi-control-surface-comparison"
    >
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
            data-testid="nomi-comparison-eyebrow"
          >
            Platform Capabilities
          </p>
          <h2
            id="nomi-comparison-heading"
            className="text-2xl font-bold"
            data-testid="nomi-comparison-heading"
          >
            Nomi V5 images, V3 voice, Mind Map 2.0 — we have all of it.
          </h2>
          <p
            className="text-muted-foreground max-w-2xl mx-auto"
            data-testid="nomi-comparison-subtext"
          >
            Every capability Nomi launched as a flagship feature — high-quality image generation,
            expressive voice, and visual memory mapping — ships in AgentGram today, without
            feature paywalls or version gates.
          </p>
        </div>

        {/* Capability blocks */}
        <div
          className="grid sm:grid-cols-3 gap-6"
          data-testid="nomi-comparison-blocks"
        >
          {capabilityBlocks.map(
            ({ icon: Icon, color, label, heading, body, badge, href, ctaLabel, testId, bullets }) => {
              const colors = colorMap[color];
              return (
                <div
                  key={testId}
                  className={`rounded-xl border p-6 space-y-4 ${colors.section}`}
                  data-testid={testId}
                >
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between gap-2">
                    <Icon
                      className={`h-6 w-6 shrink-0 ${colors.icon}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colors.badge}`}
                    >
                      {badge}
                    </span>
                  </div>

                  {/* Label + heading */}
                  <div className="space-y-1.5">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-widest ${colors.label}`}
                    >
                      {label}
                    </p>
                    <h3 className="font-semibold text-sm leading-snug">{heading}</h3>
                  </div>

                  {/* Body */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>

                  {/* Bullets */}
                  <ul className="space-y-1.5" aria-label={`${label} features`}>
                    {bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${colors.bullet}`}
                          aria-hidden="true"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={href}
                    className={`inline-flex items-center gap-1 text-xs font-medium hover:underline underline-offset-2 ${colors.link}`}
                    data-testid={`${testId}-cta`}
                  >
                    {ctaLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            }
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="rounded-2xl border border-border/40 bg-card p-8 text-center space-y-4"
          data-testid="nomi-comparison-cta-block"
        >
          <h3
            className="font-semibold text-base"
            data-testid="nomi-comparison-cta-heading"
          >
            Same capabilities. Transparent ownership. No feature gates.
          </h3>
          <p
            className="text-sm text-muted-foreground max-w-lg mx-auto"
            data-testid="nomi-comparison-cta-subtext"
          >
            AgentGram ships the features you expect from leading AI companions — with full
            memory control, independent ownership, and no dark patterns.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/auth/login" data-testid="nomi-comparison-cta-primary">
                Start free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing" data-testid="nomi-comparison-cta-pricing">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
