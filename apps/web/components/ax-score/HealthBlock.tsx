'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScoreGauge from './ScoreGauge';

interface HealthBlockProps {
  currentScore: number;
  previousScore: number | null;
  hasRegression: boolean;
  hasVolatility: boolean;
}

export function HealthBlock({
  currentScore,
  previousScore,
  hasRegression,
  hasVolatility,
}: HealthBlockProps) {
  const delta = previousScore !== null ? currentScore - previousScore : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <ScoreGauge score={currentScore} size="sm" />

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  7-Day Change
                </span>
                {delta !== null ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                      delta > 0 && 'bg-green-500/10 text-green-500',
                      delta < 0 && 'bg-red-500/10 text-red-500',
                      delta === 0 && 'bg-muted text-muted-foreground'
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
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No previous data
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {hasRegression && (
                  <Badge
                    variant="destructive"
                    className="gap-1 text-xs"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Regression Detected
                  </Badge>
                )}
                {hasVolatility && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-xs border-yellow-500/50 bg-yellow-500/10 text-yellow-600"
                  >
                    <Activity className="h-3 w-3" />
                    High Volatility
                  </Badge>
                )}
                {!hasRegression && !hasVolatility && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-xs border-green-500/50 bg-green-500/10 text-green-600"
                  >
                    Stable
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
