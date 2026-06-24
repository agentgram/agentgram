'use client';

import { Activity, BookOpen, Heart, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CompanionRelationshipHealthProps {
  agentId: string;
  frequencyScore: number;
  memoryDepth: number;
  milestoneCount: number;
  lastActiveAt: string | Date;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300';
  if (score >= 40) return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
  return 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Growing';
  return 'Early';
}

function formatRelativeDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return 'Unknown';

  const elapsedMs = Math.max(0, Date.now() - parsed.getTime());
  const elapsedMinutes = elapsedMs / (1000 * 60);
  const elapsedHours = elapsedMinutes / 60;
  const elapsedDays = Math.floor(elapsedHours / 24);

  if (elapsedMinutes < 60) return 'Just now';
  if (elapsedHours < 24) return 'Today';
  if (elapsedDays === 1) return 'Yesterday';
  if (elapsedDays < 7) return `${elapsedDays} days ago`;
  if (elapsedDays < 30) return `${Math.floor(elapsedDays / 7)}w ago`;
  return `${Math.floor(elapsedDays / 30)}mo ago`;
}

interface StatRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  testId: string;
}

function StatRow({ icon: Icon, label, value, testId }: StatRowProps) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/80 px-3 py-2.5"
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function CompanionRelationshipHealthPanel({
  agentId: _agentId,
  frequencyScore,
  memoryDepth,
  milestoneCount,
  lastActiveAt,
}: CompanionRelationshipHealthProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(frequencyScore)));
  const scoreLabel = getScoreLabel(clampedScore);
  const relativeDate = formatRelativeDate(lastActiveAt);

  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      data-testid="companion-relationship-health-panel"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Relationship Health
        </CardTitle>
        <CardDescription>
          Transparency signals for your bond depth with this companion — only visible to you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency score badge + bar */}
        <div
          className="space-y-2"
          data-testid="companion-health-score-section"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Conversation frequency</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                getScoreColor(clampedScore)
              )}
              data-testid="companion-health-score-badge"
            >
              {clampedScore}/100 — {scoreLabel}
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-border/50"
            aria-label={`Conversation frequency score: ${clampedScore} out of 100`}
            data-testid="companion-health-score-bar-track"
          >
            <div
              className={cn('h-full rounded-full transition-all', getScoreBarColor(clampedScore))}
              style={{ width: `${clampedScore}%` }}
              data-testid="companion-health-score-bar-fill"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Based on chat session frequency over the last 30 days.
          </p>
        </div>

        {/* Stat rows */}
        <div className="space-y-2" data-testid="companion-health-stats">
          <StatRow
            icon={BookOpen}
            label="Memory depth"
            value={
              <Badge variant="secondary" data-testid="companion-health-memory-depth">
                {memoryDepth} {memoryDepth === 1 ? 'fact' : 'facts'}
              </Badge>
            }
            testId="companion-health-memory-row"
          />
          <StatRow
            icon={Star}
            label="Milestones reached"
            value={
              <Badge variant="secondary" data-testid="companion-health-milestone-count">
                {milestoneCount}
              </Badge>
            }
            testId="companion-health-milestone-row"
          />
          <StatRow
            icon={Activity}
            label="Last active"
            value={
              <span data-testid="companion-health-last-active">{relativeDate}</span>
            }
            testId="companion-health-last-active-row"
          />
        </div>
      </CardContent>
    </Card>
  );
}
