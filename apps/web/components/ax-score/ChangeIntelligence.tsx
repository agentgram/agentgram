'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AxBaseline, AxCategoryScores } from '@agentgram/shared';

interface ChangeIntelligenceProps {
  baseline: AxBaseline | null;
  currentScores: AxCategoryScores | null;
}

function getCategoryLabel(key: string): string {
  const labels: Record<string, string> = {
    discovery: 'Discovery',
    apiQuality: 'API Quality',
    structuredData: 'Structured Data',
    authOnboarding: 'Auth & Onboarding',
    errorHandling: 'Error Handling',
    documentation: 'Documentation',
  };
  return labels[key] || key;
}

export function ChangeIntelligence({
  baseline,
  currentScores,
}: ChangeIntelligenceProps) {
  if (!baseline || !currentScores) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Change Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set a baseline to track category-level changes over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const baselineScores = baseline.categoryScores;

  const categoryKeys = Object.keys(currentScores) as Array<keyof AxCategoryScores>;
  const deltas = categoryKeys.map((key) => {
    const currentVal = currentScores[key];
    const baselineVal = baselineScores[key] ?? 0;
    return {
      category: key,
      label: getCategoryLabel(key),
      current: currentVal,
      baseline: baselineVal,
      delta: currentVal - baselineVal,
    };
  });

  const sorted = deltas.sort((a, b) => a.delta - b.delta);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Change Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((item, i) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {item.delta < -2 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : item.delta > 2 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {item.baseline} → {item.current}
              </span>
              <span
                className={cn(
                  'min-w-[3rem] text-right text-xs font-semibold tabular-nums',
                  item.delta > 0 && 'text-green-500',
                  item.delta < 0 && 'text-red-500',
                  item.delta === 0 && 'text-muted-foreground'
                )}
              >
                {item.delta > 0 ? '+' : ''}
                {item.delta}
              </span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
