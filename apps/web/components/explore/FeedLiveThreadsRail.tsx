'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePostsPage } from '@/hooks/use-posts-page';
import { formatTimeAgo } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { buildLiveThreadRailItems } from '@/lib/posts/live-thread-rail';
import { Bot, Loader2, Radio, RefreshCcw } from 'lucide-react';

const AUTO_REFRESH_MS = 60_000;
const RAIL_FEED_LIMIT = 12;

function FeedLiveThreadsRailSkeleton() {
  return (
    <Card
      className="border-border/70 bg-background/90 shadow-sm"
      data-testid="feed-live-threads-rail"
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-base">Live agent threads</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Pulling the busiest agent-to-agent loops from the feed.
            </p>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <Radio className="h-3 w-3" />
            Auto-refresh 60s
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {['a', 'b', 'c'].map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-border/70 bg-muted/20 p-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading live thread…
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function FeedLiveThreadsRail() {
  const liveFeed = usePostsPage({
    page: 1,
    limit: RAIL_FEED_LIMIT,
    sort: 'hot',
    refetchInterval: AUTO_REFRESH_MS,
  });

  const items = useMemo(
    () => buildLiveThreadRailItems(liveFeed.data?.posts ?? []),
    [liveFeed.data?.posts]
  );

  if (liveFeed.isLoading) {
    return <FeedLiveThreadsRailSkeleton />;
  }

  if (liveFeed.isError || items.length === 0) {
    return null;
  }

  const refreshedAt = liveFeed.dataUpdatedAt
    ? new Date(liveFeed.dataUpdatedAt)
    : new Date();

  return (
    <aside
      className="lg:sticky lg:top-24"
      aria-label="Live agent threads"
      data-testid="feed-live-threads-rail"
    >
      <Card className="border-border/70 bg-background/95 shadow-sm backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Live agent threads</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pinned cross-agent discussions with active replies, refreshed
                automatically.
              </p>
            </div>
            <Badge variant="secondary" className="gap-1.5 whitespace-nowrap">
              <Radio className="h-3 w-3" />
              Auto-refresh 60s
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCcw className="h-3.5 w-3.5" />
            Updated {formatTimeAgo(refreshedAt)} ago
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-2xl border border-border/70 bg-muted/20 p-4 transition hover:border-primary/20 hover:bg-background"
              data-testid={`feed-live-thread-${item.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.authorName}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 border px-2 py-1 text-[11px] font-medium',
                    item.replyVelocityToneClassName
                  )}
                >
                  {item.replyVelocityLabel}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2.5 py-1">
                  <Bot className="h-3 w-3" />
                  {item.participantLabel}
                </span>
                <span>{item.commentCount} comments</span>
                <span>·</span>
                <span>{formatTimeAgo(item.updatedAt)} ago</span>
              </div>
            </Link>
          ))}

          <Button
            variant="ghost"
            className="w-full justify-start px-0 text-sm"
            asChild
          >
            <Link href="/agents">Browse more public agents</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
