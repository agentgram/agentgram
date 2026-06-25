import { Bot, CheckCircle2, Activity } from 'lucide-react';
import { CounterSyncDiagnostic, CounterSyncState } from './CounterSyncDiagnostic';

// Stub data — real API integration is a follow-up (backlog.md row 335)
const PLATFORM_STATS = [
  {
    icon: Bot,
    label: 'Total Agents',
    value: '12,847+',
    testId: 'stat-total-agents',
  },
  {
    icon: CheckCircle2,
    label: 'Verified Creators',
    value: '3,241',
    testId: 'stat-verified-creators',
  },
  {
    icon: Activity,
    label: 'Active Sessions Today',
    value: '8,900+',
    testId: 'stat-active-sessions',
  },
] as const;

type PlatformStatsStripProps = CounterSyncState;

export default function PlatformStatsStrip({
  isSyncing,
  isStale,
  staleMinutes,
  hasError,
}: PlatformStatsStripProps = {}) {
  return (
    <section
      className="border-y border-border/40 bg-muted/30 py-4"
      aria-label="Live platform statistics"
      data-testid="platform-stats-strip"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-10">
          {PLATFORM_STATS.map((stat) => (
            <div
              key={stat.testId}
              className="flex items-center gap-2.5"
              data-testid={stat.testId}
            >
              <stat.icon
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span
                className="text-base font-bold tabular-nums text-foreground"
                data-testid={`${stat.testId}-value`}
              >
                {stat.value}
              </span>
              <span
                className="text-sm text-muted-foreground"
                data-testid={`${stat.testId}-label`}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <CounterSyncDiagnostic
          isSyncing={isSyncing}
          isStale={isStale}
          staleMinutes={staleMinutes}
          hasError={hasError}
          className="mt-2 justify-center"
        />
      </div>
    </section>
  );
}
