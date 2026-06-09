'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, RefreshCw } from 'lucide-react';

export interface StickinessDay {
  /** ISO date string, e.g. "2026-05-01" */
  date: string;
  /** Number of chat sessions on this day */
  sessions: number;
}

export interface AgentStickinessData {
  /** Unique visitors today */
  dailyActiveVisitors: number;
  /**
   * Engagement continuity score 0–100.
   * Formula: (users who returned within 7 days / total users) * 100, rounded.
   */
  continuityScore: number;
  /** 28-day session frequency heatmap — one entry per day */
  heatmap: StickinessDay[];
}

interface AgentStickinessPanelProps {
  data: AgentStickinessData;
}

function getHeatColor(sessions: number, max: number): string {
  if (sessions === 0 || max === 0) return 'bg-muted';
  const ratio = sessions / max;
  if (ratio >= 0.75) return 'bg-primary';
  if (ratio >= 0.5) return 'bg-primary/70';
  if (ratio >= 0.25) return 'bg-primary/40';
  return 'bg-primary/15';
}

function HeatmapGrid({ heatmap }: { heatmap: StickinessDay[] }) {
  const max = Math.max(...heatmap.map((d) => d.sessions), 1);

  // Build a 4-week (28-day) grid, 7 cols × 4 rows
  const cells = Array.from({ length: 28 }, (_, i) => heatmap[i] ?? { date: '', sessions: 0 });

  return (
    <div
      data-testid="stickiness-heatmap"
      className="grid grid-cols-7 gap-1"
      aria-label="Session frequency heatmap — last 4 weeks"
    >
      {cells.map((day, i) => (
        <div
          key={day.date || i}
          className={`aspect-square rounded-sm ${getHeatColor(day.sessions, max)}`}
          title={day.date ? `${day.date}: ${day.sessions} sessions` : 'No data'}
          aria-label={day.date ? `${day.date}: ${day.sessions} sessions` : 'No data'}
        />
      ))}
    </div>
  );
}

function ContinuityScoreRing({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const color =
    clamped >= 70 ? 'text-primary' : clamped >= 40 ? 'text-warning' : 'text-destructive';

  return (
    <div
      data-testid="continuity-score"
      className="flex flex-col items-center gap-1"
      aria-label={`Engagement continuity score: ${clamped}`}
    >
      <span className={`text-4xl font-bold tabular-nums ${color}`}>{clamped}</span>
      <span className="text-xs text-muted-foreground">/ 100</span>
    </div>
  );
}

export function AgentStickinessPanel({ data }: AgentStickinessPanelProps) {
  const { dailyActiveVisitors, continuityScore, heatmap } = data;

  return (
    <Card
      data-testid="agent-stickiness-panel"
      className="border-border/50 bg-card/50 backdrop-blur-sm"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Agent stickiness
        </CardTitle>
        <CardDescription>
          Session frequency, daily active visitors, and engagement continuity over the last 4 weeks.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metric row */}
        <div className="grid grid-cols-2 gap-4">
          <div
            data-testid="daily-active-visitors"
            className="flex flex-col gap-1 rounded-lg border border-border/60 p-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Daily active visitors
            </div>
            <p className="text-3xl font-bold tabular-nums">{dailyActiveVisitors.toLocaleString()}</p>
            <Badge variant="secondary" className="w-fit text-xs">Today</Badge>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-4 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <RefreshCw className="h-4 w-4" />
              Continuity score
            </div>
            <ContinuityScoreRing score={continuityScore} />
            <p className="text-xs text-muted-foreground text-center mt-1">
              % of users who returned within 7 days
            </p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Session frequency — last 4 weeks</p>
          <HeatmapGrid heatmap={heatmap} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            {['bg-muted', 'bg-primary/15', 'bg-primary/40', 'bg-primary/70', 'bg-primary'].map((cls) => (
              <div key={cls} className={`h-3 w-3 rounded-sm ${cls}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
