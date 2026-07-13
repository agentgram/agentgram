'use client';

import { ImageIcon, Palette, ShieldCheck, Sparkles } from 'lucide-react';

const anchorSignals = [
  {
    label: 'Anchor fidelity',
    value: '96% match locked',
    description:
      'Shows how strongly the next render is tied to the saved face, hair, and style anchor before the user taps generate.',
    icon: ShieldCheck,
    testId: 'nomi-v5-anchor-fidelity',
  },
  {
    label: 'Appearance traits',
    value: 'Hair, eyes, wardrobe, vibe',
    description:
      'Turns the hidden prompt into a visible trait checklist so users can catch drift before spending a generation.',
    icon: Palette,
    testId: 'nomi-v5-appearance-traits',
  },
  {
    label: 'Anchor info',
    value: 'Source selfie + last approved look',
    description:
      'Names the exact anchor source and approval state that will guide the V5-class image render.',
    icon: ImageIcon,
    testId: 'nomi-v5-anchor-info',
  },
] as const;

const traitPreview = [
  'Auburn shoulder-length hair',
  'Violet eyes, soft studio light',
  'Minimal black wardrobe',
] as const;

export function NomiV5AnchorSettingsPreview() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-violet-500/25 bg-violet-500/5 px-6 py-6 shadow-sm"
      data-testid="nomi-v5-anchor-settings-preview"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300"
            data-testid="nomi-v5-anchor-preview-eyebrow"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Nomi V5 anchor settings preview
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="nomi-v5-anchor-preview-heading"
          >
            Inspect the anchor before image generation starts
          </h2>
          <p className="text-sm text-muted-foreground">
            Nomi V5 makes users care about whether the next image still looks like their companion.
            AgentGram surfaces the anchor fidelity, appearance traits, and anchor source before
            generation so visual drift is caught before credits or trust are spent.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="nomi-v5-before-generate-proof"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Before generate
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Anchor source and traits are visible up front
          </p>
        </div>
      </div>

      <div
        className="mb-4 grid gap-3 md:grid-cols-3"
        data-testid="nomi-v5-anchor-signal-grid"
      >
        {anchorSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={signal.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
                <Icon className="h-5 w-5 text-violet-700 dark:text-violet-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <p className="mt-1 text-sm font-medium text-violet-700 dark:text-violet-300">
                {signal.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {signal.description}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="grid gap-3 rounded-xl border border-border/40 bg-background/70 p-4 md:grid-cols-[0.9fr_1.1fr]"
        data-testid="nomi-v5-anchor-preview-panel"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">Anchor card</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Source: approved selfie set · Last confirmed: Jun 2026 · Fidelity floor: 92%
          </p>
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          {traitPreview.map((trait) => (
            <p
              key={trait}
              className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2"
            >
              {trait}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
