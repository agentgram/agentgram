'use client';

import { Activity, Captions, CheckCircle2, LifeBuoy, SignalHigh, Wifi } from 'lucide-react';

const readinessChecks = [
  {
    label: 'Readiness',
    value: 'Camera, mic, and transcript route verified',
    description: 'Shows pre-call pass/fail state before a Kindroid-style video call opens.',
    icon: CheckCircle2,
    testId: 'stability-console-readiness',
  },
  {
    label: 'Connection',
    value: 'Stable video route selected',
    description: 'Keeps latency, packet-loss, and reconnect status visible while the call is live.',
    icon: SignalHigh,
    testId: 'stability-console-connection',
  },
  {
    label: 'Fallbacks',
    value: 'Voice-only + retry guidance ready',
    description: 'Gives users a next step before they abandon a broken call.',
    icon: LifeBuoy,
    testId: 'stability-console-fallbacks',
  },
] as const;

const transcriptLines = [
  {
    speaker: 'Mina',
    timestamp: '00:08',
    text: 'I can see you clearly now — the call is stable.',
  },
  {
    speaker: 'You',
    timestamp: '00:12',
    text: 'Great, keep captions on and save the troubleshooting note.',
  },
  {
    speaker: 'Console',
    timestamp: '00:14',
    text: 'Live transcript synced; reconnect tips remain pinned.',
  },
] as const;

const troubleshootingSteps = [
  'Refresh camera permission without leaving the call',
  'Switch to voice-only if video drops twice',
  'Export transcript and stability log after disconnect',
] as const;

export function KindroidLiveCallStabilityConsole() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-indigo-500/25 bg-indigo-500/5 px-6 py-6 shadow-sm"
      data-testid="kindroid-live-call-stability-console"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300"
            data-testid="stability-console-eyebrow"
          >
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            Live-call stability console
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="stability-console-heading"
          >
            Show readiness, captions, and fixes before the video call fails
          </h2>
          <p className="text-sm text-muted-foreground">
            Kindroid-style live calls can feel fragile when users lose track of readiness,
            captions, or what to try next. AgentGram keeps the video-call status,
            live transcript, and troubleshooting path in one visible console before and
            during the call.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="stability-console-ready-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <Wifi className="h-4 w-4" aria-hidden="true" />
            Ready + live
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Preflight, captions, and recovery guidance stay pinned
          </p>
        </div>
      </div>

      <div
        className="mb-4 grid gap-3 md:grid-cols-3"
        data-testid="stability-console-readiness-grid"
      >
        {readinessChecks.map((check) => {
          const Icon = check.icon;

          return (
            <div
              key={check.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={check.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                <Icon className="h-5 w-5 text-indigo-700 dark:text-indigo-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{check.label}</p>
              <p className="mt-1 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {check.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {check.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div
          className="rounded-xl border border-border/40 bg-background/70 p-4"
          data-testid="stability-console-live-transcript"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Captions className="h-4 w-4 text-indigo-700 dark:text-indigo-300" aria-hidden="true" />
              Live transcript
            </p>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              syncing
            </span>
          </div>
          <div className="space-y-2">
            {transcriptLines.map((line) => (
              <p key={`${line.timestamp}-${line.speaker}`} className="rounded-lg border border-border/30 bg-background/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">{line.speaker}</span>{' '}
                <span className="text-indigo-700 dark:text-indigo-300">{line.timestamp}</span>{' '}
                {line.text}
              </p>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl border border-border/40 bg-background/70 p-4"
          data-testid="stability-console-troubleshooting"
        >
          <p className="text-sm font-semibold text-foreground">Troubleshooting pinned</p>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            {troubleshootingSteps.map((step) => (
              <p key={step} className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                {step}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
