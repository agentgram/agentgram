'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const STORAGE_KEY = 'agentgram:timeBudget';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MOCK_WEEKLY_MINUTES = [25, 45, 0, 60, 30, 10, 0];

interface TimeBudgetGoals {
  dailyMinutes: number;
  weeklyHours: number;
}

function loadGoals(): TimeBudgetGoals {
  if (typeof window === 'undefined') {
    return { dailyMinutes: 30, weeklyHours: 3 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dailyMinutes: 30, weeklyHours: 3 };
    const parsed = JSON.parse(raw) as Partial<TimeBudgetGoals>;
    return {
      dailyMinutes: typeof parsed.dailyMinutes === 'number' ? parsed.dailyMinutes : 30,
      weeklyHours: typeof parsed.weeklyHours === 'number' ? parsed.weeklyHours : 3,
    };
  } catch {
    return { dailyMinutes: 30, weeklyHours: 3 };
  }
}

function saveGoals(goals: TimeBudgetGoals): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // storage full — silently ignore
  }
}

function WeeklyTrendBar({
  label,
  minutes,
  goalMinutes,
}: {
  label: string;
  minutes: number;
  goalMinutes: number;
}) {
  const maxBarHeight = 48;
  const maxMinutes = Math.max(...MOCK_WEEKLY_MINUTES, goalMinutes, 1);
  const heightPct = Math.min(minutes / maxMinutes, 1);
  const overGoal = minutes > goalMinutes;

  return (
    <div
      className="flex flex-col items-center gap-1"
      data-testid={`trend-bar-${label.toLowerCase()}`}
    >
      <div
        className="relative flex w-8 flex-col justify-end"
        style={{ height: `${maxBarHeight}px` }}
      >
        <div
          aria-label={`${label}: ${minutes} min`}
          className={`w-full rounded-sm transition-all ${
            overGoal
              ? 'bg-amber-500/80 dark:bg-amber-400/80'
              : 'bg-primary/60'
          }`}
          style={{ height: `${Math.round(heightPct * maxBarHeight)}px` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export interface TimeBudgetPanelProps {
  /** Injected in tests to avoid localStorage access during SSR */
  initialGoals?: TimeBudgetGoals;
}

export function TimeBudgetPanel({ initialGoals }: TimeBudgetPanelProps) {
  const [goals, setGoals] = useState<TimeBudgetGoals>(
    initialGoals ?? { dailyMinutes: 30, weeklyHours: 3 }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({ tone: 'idle', message: '' });

  useEffect(() => {
    if (!initialGoals) {
      setGoals(loadGoals());
    }
  }, [initialGoals]);

  const handleSave = () => {
    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });
    try {
      saveGoals(goals);
      setStatus({ tone: 'success', message: 'Session goals saved.' });
    } catch {
      setStatus({ tone: 'error', message: 'Could not save. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const totalWeekMinutes = MOCK_WEEKLY_MINUTES.reduce((a, b) => a + b, 0);
  const weeklyGoalMinutes = goals.weeklyHours * 60;
  const weeklyPct = Math.round((totalWeekMinutes / Math.max(weeklyGoalMinutes, 1)) * 100);

  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      data-testid="time-budget-panel"
    >
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          Session time goals
          <Badge
            className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400"
            variant="outline"
            data-testid="time-budget-free-badge"
          >
            Wellbeing
          </Badge>
        </CardTitle>
        <CardDescription>
          Set voluntary daily and weekly session goals to keep your companion
          time intentional. Based on CHI 2026 research on healthy AI companion
          use patterns.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="daily-goal"
            >
              Daily session goal (minutes)
            </label>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                data-testid="daily-goal-input"
                id="daily-goal"
                min={5}
                max={480}
                onChange={(e) =>
                  setGoals((prev) => ({
                    ...prev,
                    dailyMinutes: Math.max(5, Number(e.target.value) || 5),
                  }))
                }
                type="number"
                value={goals.dailyMinutes}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 30 min/day
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="weekly-goal"
            >
              Weekly session goal (hours)
            </label>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                data-testid="weekly-goal-input"
                id="weekly-goal"
                min={0.5}
                max={40}
                step={0.5}
                onChange={(e) =>
                  setGoals((prev) => ({
                    ...prev,
                    weeklyHours: Math.max(0.5, Number(e.target.value) || 0.5),
                  }))
                }
                type="number"
                value={goals.weeklyHours}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 3 hr/week
            </p>
          </div>
        </div>

        <div
          className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4"
          data-testid="weekly-trend-section"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              This week
            </span>
            <span
              className="text-xs text-muted-foreground"
              data-testid="weekly-trend-summary"
            >
              {totalWeekMinutes} min of {weeklyGoalMinutes} min goal ({weeklyPct}%)
            </span>
          </div>
          <div
            className="flex items-end justify-between gap-1"
            data-testid="weekly-trend-chart"
          >
            {WEEK_DAYS.map((day, i) => (
              <WeeklyTrendBar
                key={day}
                label={day}
                minutes={MOCK_WEEKLY_MINUTES[i]}
                goalMinutes={goals.dailyMinutes}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Amber bars exceed your daily goal.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            status.tone === 'error'
              ? 'text-destructive'
              : status.tone === 'success'
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-muted-foreground'
          }`}
          role="status"
        >
          {status.message || 'Goals are saved locally on this device.'}
        </p>
        <Button
          data-testid="time-budget-save-btn"
          disabled={isSaving}
          onClick={handleSave}
          type="button"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save goals'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
