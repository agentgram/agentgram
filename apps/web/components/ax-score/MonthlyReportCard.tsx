'use client';

import { motion } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AxMonthlyReport } from '@agentgram/shared';

interface MonthlyReportCardProps {
  report: AxMonthlyReport;
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function getScoreTrendDelta(scoreTrend: unknown): number | null {
  if (!Array.isArray(scoreTrend) || scoreTrend.length < 2) return null;
  const first = scoreTrend[0] as { score?: number };
  const last = scoreTrend[scoreTrend.length - 1] as { score?: number };
  if (typeof first.score !== 'number' || typeof last.score !== 'number') return null;
  return last.score - first.score;
}

export function MonthlyReportCard({ report }: MonthlyReportCardProps) {
  const delta = getScoreTrendDelta(report.scoreTrend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">{formatMonth(report.month)}</h4>
                {report.status === 'generating' && (
                  <Badge variant="secondary" className="text-[10px]">
                    Generating...
                  </Badge>
                )}
                {report.status === 'failed' && (
                  <Badge variant="destructive" className="text-[10px]">
                    Failed
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {report.title}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {delta !== null && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold',
                    delta > 0 && 'text-green-500',
                    delta < 0 && 'text-red-500',
                    delta === 0 && 'text-muted-foreground'
                  )}
                >
                  {delta > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : delta < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {delta > 0 ? '+' : ''}
                  {delta}
                </span>
              )}
              {report.alertCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Bell className="h-3 w-3" />
                  {report.alertCount}
                </span>
              )}
            </div>
          </div>
          {report.summary && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {report.summary}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
