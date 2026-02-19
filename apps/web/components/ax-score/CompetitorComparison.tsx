'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CompetitorComparisonResponse } from '@agentgram/shared';

interface CompetitorComparisonProps {
  comparison: CompetitorComparisonResponse;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function CompetitorComparison({ comparison }: CompetitorComparisonProps) {
  // Merge and sort all sites by score descending
  const allSites = [
    ...comparison.developerSites.map((s) => ({
      ...s,
      isOwn: true,
      percentile: s.percentileRank,
    })),
    ...comparison.sites.map((s) => ({
      ...s,
      isOwn: false,
      percentile: null as number | null,
    })),
  ].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Comparison: {comparison.setName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allSites.map((site, i) => {
          const hostname = (() => {
            try {
              return new URL(site.url).hostname;
            } catch {
              return site.url;
            }
          })();

          return (
            <motion.div
              key={site.url}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'flex items-center gap-3 rounded-lg p-2',
                site.isOwn && 'bg-primary/5 ring-1 ring-primary/20'
              )}
            >
              <span className="w-6 text-center text-xs font-medium text-muted-foreground">
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm truncate">
                    {site.name || hostname}
                  </span>
                  {site.isOwn && (
                    <Badge variant="default" className="text-[10px]">
                      You
                    </Badge>
                  )}
                  {site.percentile !== null && (
                    <Badge variant="secondary" className="text-[10px]">
                      P{site.percentile}
                    </Badge>
                  )}
                </div>
                {site.score !== null && (
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full', getScoreBarColor(site.score))}
                      style={{ width: `${site.score}%` }}
                    />
                  </div>
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-bold tabular-nums w-8 text-right',
                  site.score !== null ? getScoreColor(site.score) : 'text-muted-foreground'
                )}
              >
                {site.score ?? '-'}
              </span>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
