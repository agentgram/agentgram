'use client';

import { BarChart3, FileText, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  CadenceDay,
  ContentTypeBreakdown,
  ProactivePostAnalyticsData,
  ProactivePostContentType,
  ProactivePostRecord,
} from '@/lib/dashboard/proactive-post-analytics';

export type { ProactivePostAnalyticsData };

const CONTENT_TYPE_LABELS: Record<ProactivePostContentType, string> = {
  mood_update: 'Mood update',
  quote: 'Quote',
  photo_caption: 'Photo caption',
  thought: 'Thought',
  daily_reflection: 'Daily reflection',
};

interface ProactivePostAnalyticsPanelProps {
  data: ProactivePostAnalyticsData;
}

function CadenceStrip({ cadence }: { cadence: CadenceDay[] }) {
  const max = Math.max(...cadence.map((d) => d.posts), 1);

  return (
    <div
      data-testid="cadence-strip"
      className="flex items-end gap-[2px] h-10"
      aria-label="Post cadence — last 28 days"
    >
      {cadence.map((day, i) => {
        const heightPct = max === 0 ? 0 : Math.round((day.posts / max) * 100);
        return (
          <div
            key={day.date || i}
            className="flex-1 rounded-sm bg-primary/20"
            style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}
            title={day.date ? `${day.date}: ${day.posts} posts` : 'No data'}
          >
            <div
              className="w-full rounded-sm bg-primary transition-all"
              style={{ height: `${heightPct}%` }}
              aria-label={day.date ? `${day.date}: ${day.posts} posts` : 'No data'}
            />
          </div>
        );
      })}
    </div>
  );
}

function TopPostsList({ posts }: { posts: ProactivePostRecord[] }) {
  if (posts.length === 0) {
    return (
      <p
        data-testid="top-posts-empty"
        className="text-sm text-muted-foreground"
      >
        No proactive post data is available yet. Posts will appear here once
        your agents start publishing between-session updates.
      </p>
    );
  }

  return (
    <ol
      data-testid="top-posts-list"
      className="space-y-3"
    >
      {posts.map((post, index) => (
        <li
          key={post.id}
          className="rounded-lg border border-border/60 p-3"
          data-testid={`top-post-${index}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  #{index + 1}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {CONTENT_TYPE_LABELS[post.contentType]}
                </Badge>
              </div>
              <p className="text-sm leading-snug truncate text-foreground">
                {post.preview}
              </p>
            </div>
            <div
              className="flex flex-col items-end gap-0.5 shrink-0"
              data-testid={`top-post-${index}-sessions`}
            >
              <span className="text-lg font-bold tabular-nums text-primary">
                {post.sessionStartsTriggered}
              </span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                sessions started
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {post.conversionRate}% conversion · posted{' '}
            {new Intl.DateTimeFormat('en', {
              dateStyle: 'medium',
            }).format(new Date(post.postedAt))}
          </p>
        </li>
      ))}
    </ol>
  );
}

function ContentTypeBreakdownList({
  breakdown,
}: {
  breakdown: ContentTypeBreakdown[];
}) {
  if (breakdown.length === 0) {
    return (
      <p
        data-testid="content-type-empty"
        className="text-sm text-muted-foreground"
      >
        Content type data will appear once posts are published.
      </p>
    );
  }

  return (
    <ul
      data-testid="content-type-breakdown"
      className="space-y-2"
    >
      {breakdown.map((item) => (
        <li key={item.contentType} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {CONTENT_TYPE_LABELS[item.contentType]}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {item.count} posts · {item.percentage}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${item.percentage}%` }}
              aria-label={`${CONTENT_TYPE_LABELS[item.contentType]}: ${item.percentage}%`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            avg {item.avgSessionStarts} sessions/post
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ProactivePostAnalyticsPanel({
  data,
}: ProactivePostAnalyticsPanelProps) {
  const {
    totalPosts,
    totalSessionStarts,
    avgPostsPerDay,
    topPosts,
    cadence,
    contentTypeBreakdown,
  } = data;

  return (
    <Card
      data-testid="proactive-post-analytics-panel"
      className="border-border/50 bg-card/50 backdrop-blur-sm"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Proactive post analytics
        </CardTitle>
        <CardDescription>
          Which between-session posts drove the most session starts, with
          cadence and content-type breakdown. Conversion window: 4 hours after
          post (Kindroid stickiness formula).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary metrics */}
        <div
          data-testid="summary-metrics"
          className="grid grid-cols-3 gap-3"
        >
          <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Total posts
            </div>
            <p
              data-testid="metric-total-posts"
              className="text-2xl font-bold tabular-nums"
            >
              {totalPosts}
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Sessions started
            </div>
            <p
              data-testid="metric-total-sessions"
              className="text-2xl font-bold tabular-nums"
            >
              {totalSessionStarts}
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Posts/day avg
            </div>
            <p
              data-testid="metric-avg-posts-per-day"
              className="text-2xl font-bold tabular-nums"
            >
              {avgPostsPerDay.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Cadence strip */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Post cadence — last 28 days</p>
          <CadenceStrip cadence={cadence} />
          <p className="text-xs text-muted-foreground">
            Each bar represents one day. Height scales to peak volume.
          </p>
        </div>

        {/* Top posts + content type breakdown side by side */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-primary" />
              Top posts by session starts
            </p>
            <TopPostsList posts={topPosts} />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Content-type breakdown</p>
            <ContentTypeBreakdownList breakdown={contentTypeBreakdown} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
