'use client';

import { ArrowRight, BadgeCheck, BarChart3, Repeat2, Rocket, Users } from 'lucide-react';

const liftSignals = [
  {
    label: 'Discovery lift',
    value: '+38% directory impressions',
    description:
      'Shows how often the newly published character is being surfaced in search, topic rails, and recommendation cards.',
    icon: BarChart3,
    testId: 'cai-creator-discovery-lift',
  },
  {
    label: 'Follows after publish',
    value: '+124 new followers',
    description:
      'Connects the publish event to follower growth so creators can tell whether the launch actually built an audience.',
    icon: Users,
    testId: 'cai-creator-follows-lift',
  },
  {
    label: 'Remix lift',
    value: '17 creator remixes',
    description:
      'Highlights derivative personas, prompt forks, and remix activity that prove the character is inspiring new work.',
    icon: Repeat2,
    testId: 'cai-creator-remix-lift',
  },
] as const;

const publishTimeline = [
  'Publish: character goes live with creator attribution and source prompts locked',
  'First 24h: discovery, follow, and remix deltas are compared to the pre-publish baseline',
  'Next step: creator gets a recommended boost action instead of guessing what worked',
] as const;

export function CharacterAICreatorDiscoveryLiftCard() {
  return (
    <div
      className="mx-auto max-w-3xl rounded-2xl border border-indigo-500/25 bg-indigo-500/5 px-6 py-6 shadow-sm"
      data-testid="cai-creator-discovery-lift-card"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300"
            data-testid="cai-creator-lift-eyebrow"
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
            Creator discovery lift
          </p>
          <h2
            className="text-xl font-bold text-foreground"
            data-testid="cai-creator-lift-heading"
          >
            Show creators what happened after their character was published
          </h2>
          <p className="text-sm text-muted-foreground">
            Character.AI is making creator growth and discovery a front-door promise.
            AgentGram answers with a post-publish lift card that turns a launch into
            visible discovery, follow, and remix outcomes creators can act on.
          </p>
        </div>
        <div
          className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm"
          data-testid="cai-creator-lift-published-badge"
        >
          <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Published character report
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Discovery, follows, and remix lift visible after publish
          </p>
        </div>
      </div>

      <div
        className="mb-4 grid gap-3 md:grid-cols-3"
        data-testid="cai-creator-lift-signal-grid"
      >
        {liftSignals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="rounded-xl border border-border/40 bg-background/70 p-4"
              data-testid={signal.testId}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                <Icon className="h-5 w-5 text-indigo-700 dark:text-indigo-300" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground">{signal.label}</p>
              <p className="mt-1 text-sm font-medium text-indigo-700 dark:text-indigo-300">
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
        className="rounded-xl border border-border/40 bg-background/70 p-4"
        data-testid="cai-creator-lift-timeline"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Post-publish lift path</p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Growth action ready
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          {publishTimeline.map((item) => (
            <p key={item} className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
