'use client';

import { Clock, Flame, Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface SinceYouWereAwayCardProps {
  lastVisitedAt: string | Date;
  streakDays: number;
  companionName?: string;
  latestMilestone?: string;
}

function getHoursAway(lastVisitedAt: string | Date): number {
  const last = typeof lastVisitedAt === 'string' ? new Date(lastVisitedAt) : lastVisitedAt;
  return (Date.now() - last.getTime()) / (1000 * 60 * 60);
}

function formatDaysAway(hoursAway: number): string {
  const days = Math.floor(hoursAway / 24);
  if (days === 0) return 'less than a day';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function SinceYouWereAwayCard({
  lastVisitedAt,
  streakDays,
  companionName,
  latestMilestone,
}: SinceYouWereAwayCardProps) {
  const hoursAway = getHoursAway(lastVisitedAt);

  if (hoursAway <= 8) return null;

  const daysAwayLabel = formatDaysAway(hoursAway);
  const streakBroken = hoursAway > 24;

  return (
    <Card
      className="border-primary/20 bg-primary/5 backdrop-blur-sm"
      data-testid="since-you-were-away-card"
    >
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center gap-2 text-lg"
          data-testid="since-you-were-away-header"
        >
          <Clock className="h-5 w-5 text-primary" aria-hidden />
          {companionName
            ? `Welcome back! ${companionName} missed you.`
            : 'Welcome back!'}
        </CardTitle>
        <p
          className="text-sm text-muted-foreground"
          data-testid="since-you-were-away-subtext"
        >
          You were away for {daysAwayLabel}.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Streak status */}
        <div
          className="flex items-center gap-2"
          data-testid="since-you-were-away-streak"
        >
          <Flame
            className={`h-4 w-4 ${streakBroken ? 'text-muted-foreground' : 'text-orange-500'}`}
            aria-hidden
          />
          {streakBroken ? (
            <Badge variant="outline" data-testid="since-you-were-away-streak-badge">
              Streak reset — start fresh today
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400"
              data-testid="since-you-were-away-streak-badge"
            >
              {streakDays} day streak continuing
            </Badge>
          )}
        </div>

        {/* Platform update blurb */}
        <div
          className="flex items-center gap-2"
          data-testid="since-you-were-away-update-blurb"
        >
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm text-muted-foreground">
            New features added since your visit — explore what&apos;s new.
          </span>
        </div>

        {/* Latest milestone */}
        {latestMilestone && (
          <div
            className="flex items-center gap-2"
            data-testid="since-you-were-away-milestone"
          >
            <Trophy className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-sm text-foreground font-medium">
              {latestMilestone}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
