'use client';

import { useState } from 'react';
import { CheckCircle2, Cloud, FileText, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const transcriptProviders = [
  {
    id: 'agentgram-live',
    name: 'AgentGram Live',
    badge: 'Default',
    description: 'Realtime transcript with speaker turns, timestamps, and call-health markers saved to the session recap.',
    detail: 'Best when you want a ready-to-share call summary as soon as the companion call ends.',
    testId: 'kindroid-transcript-provider-agentgram',
  },
  {
    id: 'bring-your-own',
    name: 'Bring your provider',
    badge: 'API key',
    description: 'Route transcription through your preferred speech API while keeping AgentGram memory controls intact.',
    detail: 'Useful for teams standardizing on a vendor-specific transcription stack or language model.',
    testId: 'kindroid-transcript-provider-byop',
  },
  {
    id: 'local-export',
    name: 'Local export only',
    badge: 'Private',
    description: 'Keep call audio off third-party transcription and export the conversation notes manually after review.',
    detail: 'A privacy-first option for sensitive calls, audits, or creator QA before anything enters long-term memory.',
    testId: 'kindroid-transcript-provider-local',
  },
] as const;

type TranscriptProviderId = (typeof transcriptProviders)[number]['id'];

const trustSignals = [
  'Provider choice is visible before joining a call',
  'Transcript storage stays tied to memory review controls',
  'Fallback mode keeps notes exportable when live captions fail',
] as const;

export function KindroidTranscriptProviderPicker() {
  const [selectedProvider, setSelectedProvider] = useState<TranscriptProviderId>('agentgram-live');
  const selected = transcriptProviders.find((provider) => provider.id === selectedProvider) ?? transcriptProviders[0];

  return (
    <div
      className="mx-auto max-w-4xl rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-6 shadow-sm"
      data-testid="kindroid-transcript-provider-picker"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
            data-testid="kindroid-transcript-picker-eyebrow"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Kindroid call transcript control
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="kindroid-transcript-picker-heading"
          >
            Pick the transcript provider before the call starts
          </h2>
          <p className="text-sm text-muted-foreground">
            Kindroid&apos;s live-call push makes transcription feel like a black box. AgentGram shows the caption route first, so creators know whether live transcripts, a preferred provider, or local-only notes will power the recap.
          </p>
        </div>

        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="kindroid-transcript-picker-selected-summary"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {selected.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{selected.badge} transcript route selected</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3" data-testid="kindroid-transcript-provider-options">
        {transcriptProviders.map((provider) => {
          const isSelected = provider.id === selectedProvider;

          return (
            <button
              key={provider.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedProvider(provider.id)}
              className={`rounded-xl border p-4 text-left transition ${
                isSelected
                  ? 'border-amber-500/60 bg-amber-500/15 shadow-sm'
                  : 'border-border/40 bg-background/70 hover:border-amber-500/40'
              }`}
              data-testid={provider.testId}
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                {provider.id === 'agentgram-live' ? (
                  <FileText className="h-5 w-5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                ) : provider.id === 'bring-your-own' ? (
                  <Cloud className="h-5 w-5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                )}
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{provider.name}</span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  {provider.badge}
                </span>
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                {provider.description}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="mt-5 rounded-xl border border-border/40 bg-background/70 p-4"
        data-testid="kindroid-transcript-provider-detail"
      >
        <p className="text-sm font-semibold text-foreground">{selected.name} in practice</p>
        <p className="mt-1 text-sm text-muted-foreground">{selected.detail}</p>
      </div>

      <ul
        className="mt-5 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"
        data-testid="kindroid-transcript-trust-signals"
      >
        {trustSignals.map((signal) => (
          <li key={signal} className="flex items-start gap-2 rounded-lg bg-background/60 px-3 py-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>{signal}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
