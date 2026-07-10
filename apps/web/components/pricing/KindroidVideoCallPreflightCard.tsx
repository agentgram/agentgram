'use client';

import { Camera, CheckCircle2, Gauge, Mic2, ShieldCheck, Video } from 'lucide-react';

const readinessSignals = [
  {
    label: 'Camera',
    value: 'HD camera ready',
    description: 'Confirms video permissions and framing before the live companion room opens.',
    icon: Camera,
    testId: 'kindroid-video-preflight-camera',
  },
  {
    label: 'Microphone',
    value: 'Mic input verified',
    description: 'Shows the selected microphone and input health before users press start.',
    icon: Mic2,
    testId: 'kindroid-video-preflight-microphone',
  },
  {
    label: 'Estimated latency',
    value: '~180ms round trip',
    description: 'Sets an expected response window up front so lag does not feel like a surprise.',
    icon: Gauge,
    testId: 'kindroid-video-preflight-latency',
  },
] as const;

const availabilityChecks = [
  'Video calls available on this plan',
  'Browser permissions checked before connect',
  'Fallback to voice-only if camera drops',
] as const;

export function KindroidVideoCallPreflightCard() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-sky-500/25 bg-sky-500/5 px-6 py-6 shadow-sm"
      data-testid="kindroid-video-call-preflight-card"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300"
            data-testid="kindroid-video-preflight-eyebrow"
          >
            <Video className="h-3.5 w-3.5" aria-hidden="true" />
            Live video-call preflight
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="kindroid-video-preflight-heading"
          >
            Know camera, mic, latency, and availability before the call starts
          </h2>
          <p className="text-sm text-muted-foreground">
            Kindroid-style live video calls can leave users guessing whether their camera,
            microphone, or plan is ready. AgentGram turns those checks into a visible
            pre-call card before anyone connects.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="kindroid-video-preflight-availability-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Video call available
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Plan + device readiness checked before connecting
          </p>
        </div>
      </div>

      <div
        className="grid gap-3 md:grid-cols-3"
        data-testid="kindroid-video-preflight-signals"
      >
        {readinessSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={signal.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                <Icon className="h-5 w-5 text-sky-700 dark:text-sky-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <p className="mt-1 text-sm font-medium text-sky-700 dark:text-sky-300">
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
        className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3"
        data-testid="kindroid-video-preflight-availability-checks"
      >
        {availabilityChecks.map((check) => (
          <p key={check} className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
            <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            {check}
          </p>
        ))}
      </div>
    </div>
  );
}
