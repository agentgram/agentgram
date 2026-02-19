'use client';

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SimulateResponse } from '@agentgram/shared';

interface SimulationResultProps {
  result: SimulateResponse;
  className?: string;
}

export default function SimulationResult({
  result,
  className,
}: SimulationResultProps) {
  const Icon = result.wouldRecommend ? ThumbsUp : ThumbsDown;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            AI Simulation Result
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Query: &ldquo;{result.query}&rdquo;
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-full',
                result.wouldRecommend
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                {result.wouldRecommend
                  ? 'Would recommend'
                  : 'Would not recommend'}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.confidence}% confidence
              </p>
            </div>
          </div>

          <p className="text-sm">{result.reasoning}</p>

          {result.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Suggestions
              </h4>
              <ul className="space-y-1">
                {result.suggestions.map((suggestion, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-muted-foreground/50 mt-px">-</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
