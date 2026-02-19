'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ScanResultCardProps {
  id: string;
  url: string;
  score: number;
  status: string;
  createdAt: string;
  durationMs: number | null;
  onClick?: () => void;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function formatDuration(ms: number | null): string {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ScanResultCard({
  url,
  score,
  status,
  createdAt,
  durationMs,
  onClick,
  className,
}: ScanResultCardProps) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/50',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div
            className={cn(
              'text-2xl font-bold tabular-nums w-12 text-center',
              getScoreColor(score)
            )}
          >
            {score}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium truncate">{hostname}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span>{formatDate(createdAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(durationMs)}
              </span>
              <span
                className={cn(
                  'capitalize',
                  status === 'completed' && 'text-green-500',
                  status === 'failed' && 'text-red-500'
                )}
              >
                {status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
