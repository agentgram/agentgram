'use client';

import { CheckCircle2, Gauge, Mic2, PhoneCall, Signal } from 'lucide-react';

const preflightSignals = [
  {
    label: 'Call quality',
    value: 'HD-ready',
    description: 'Shows whether the current route is clear enough for a smooth companion call.',
    icon: Signal,
    testId: 'voice-preflight-quality',
  },
  {
    label: 'Latency',
    value: '<2s first audio target',
    description: 'Surfaces expected response speed before you press start, not after the call feels laggy.',
    icon: Gauge,
    testId: 'voice-preflight-latency',
  },
  {
    label: 'Voice mode',
    value: 'Natural voice selected',
    description: 'Confirms the speaking style and mode so users know exactly what will answer.',
    icon: Mic2,
    testId: 'voice-preflight-mode',
  },
] as const;

export function ReplikaVoiceCallPreflightCard() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-cyan-500/25 bg-cyan-500/5 px-6 py-6 shadow-sm"
      data-testid="replika-voice-call-preflight-card"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300"
            data-testid="voice-preflight-eyebrow"
          >
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            Voice-call preflight
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="voice-preflight-heading"
          >
            Know call quality before you start talking
          </h2>
          <p className="text-sm text-muted-foreground">
            Replika users often learn whether a call feels clear only after the session starts.
            AgentGram makes the pre-call state visible first: quality, latency, and selected voice mode.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="voice-preflight-ready-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Ready check first
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Quality + latency + voice mode shown before connecting
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3" data-testid="voice-preflight-signals">
        {preflightSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={signal.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                <Icon className="h-5 w-5 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <p className="mt-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                {signal.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {signal.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
