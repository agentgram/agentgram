'use client';

import { useState } from 'react';
import { Captions, CheckCircle2, Download, PlugZap, RadioTower } from 'lucide-react';

const transcriptProviders = [
  {
    id: 'agentgram-live',
    label: 'AgentGram Live',
    badge: 'Default live captions',
    summary: 'Realtime transcript is ready before the call connects.',
    detail:
      'AgentGram Live captures speaker turns, timestamps, and call-health markers in one route so users know the transcript will be usable before they start talking.',
    icon: RadioTower,
  },
  {
    id: 'bring-your-provider',
    label: 'Bring your provider',
    badge: 'Route your own speech API',
    summary: 'Use your preferred transcript provider without losing memory controls.',
    detail:
      'Choose an external speech stack for captions while AgentGram keeps the provider choice, memory permissions, and export controls visible in the same pre-call panel.',
    icon: PlugZap,
  },
  {
    id: 'local-export-only',
    label: 'Local export only',
    badge: 'Manual notes fallback',
    summary: 'Skip live captions and keep a privacy-first export path.',
    detail:
      'When a live transcript is not appropriate, users can keep call notes local and export only the final transcript package they approve.',
    icon: Download,
  },
] as const;

const trustSignals = [
  'Provider choice locked before connect',
  'Speaker turns stay attached to memory permissions',
  'Fallback export path remains visible',
] as const;

type TranscriptProviderId = (typeof transcriptProviders)[number]['id'];

export function KindroidTranscriptProviderPicker() {
  const [selectedProviderId, setSelectedProviderId] = useState<TranscriptProviderId>(
    transcriptProviders[0].id
  );
  const selectedProvider =
    transcriptProviders.find((provider) => provider.id === selectedProviderId) ??
    transcriptProviders[0];

  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-6 shadow-sm"
      data-testid="kindroid-transcript-provider-picker"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
            data-testid="transcript-provider-eyebrow"
          >
            <Captions className="h-3.5 w-3.5" aria-hidden="true" />
            Transcript provider picker
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="transcript-provider-heading"
          >
            Pick the transcript route before your companion call starts
          </h2>
          <p className="text-sm text-muted-foreground">
            Kindroid-style call transcripts can feel opaque when users do not know
            which caption route is active. AgentGram makes the provider choice,
            fallback, and memory handoff visible up front.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="transcript-provider-selected-summary"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {selectedProvider.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedProvider.summary}
          </p>
        </div>
      </div>

      <div
        className="mb-5 grid gap-3 md:grid-cols-3"
        data-testid="transcript-provider-options"
        aria-label="Choose transcript provider route"
      >
        {transcriptProviders.map((provider) => {
          const Icon = provider.icon;
          const isSelected = provider.id === selectedProvider.id;

          return (
            <button
              key={provider.id}
              type="button"
              className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? 'border-amber-500/60 bg-amber-500/15 shadow-sm'
                  : 'border-border/40 bg-background/70 hover:border-amber-500/40'
              }`}
              aria-pressed={isSelected}
              data-testid={`transcript-provider-${provider.id}`}
              onClick={() => setSelectedProviderId(provider.id)}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <Icon className="h-5 w-5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{provider.label}</p>
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                {provider.badge}
              </p>
            </button>
          );
        })}
      </div>

      <div
        className="rounded-xl border border-border/40 bg-background/70 p-4"
        data-testid="transcript-provider-detail"
      >
        <p className="text-sm font-semibold text-foreground">
          {selectedProvider.summary}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {selectedProvider.detail}
        </p>
      </div>

      <div
        className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3"
        data-testid="transcript-provider-trust-signals"
      >
        {trustSignals.map((signal) => (
          <p key={signal} className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
            {signal}
          </p>
        ))}
      </div>
    </div>
  );
}
