'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

const SIZES = {
  sm: { outer: 80, stroke: 6, text: 'text-lg', label: 'text-[10px]' },
  md: { outer: 120, stroke: 8, text: 'text-3xl', label: 'text-xs' },
  lg: { outer: 160, stroke: 10, text: 'text-4xl', label: 'text-sm' },
};

export default function ScoreGauge({
  score,
  size = 'md',
  className,
}: ScoreGaugeProps) {
  const config = SIZES[size];
  const radius = (config.outer - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: config.outer, height: config.outer }}
    >
      <svg
        width={config.outer}
        height={config.outer}
        viewBox={`0 0 ${config.outer} ${config.outer}`}
        className="-rotate-90"
      >
        <circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted/30"
        />
        <motion.circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          className={getScoreColor(score)}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('font-bold', config.text, getScoreColor(score))}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className={cn('text-muted-foreground', config.label)}>
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}
