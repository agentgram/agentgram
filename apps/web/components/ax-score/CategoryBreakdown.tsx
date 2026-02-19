'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Code,
  Database,
  KeyRound,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AxCategoryScores } from '@agentgram/shared';

interface CategoryBreakdownProps {
  scores: AxCategoryScores;
  className?: string;
}

const CATEGORIES = [
  { key: 'discovery' as const, label: 'Discovery', icon: Search },
  { key: 'apiQuality' as const, label: 'API Quality', icon: Code },
  { key: 'structuredData' as const, label: 'Structured Data', icon: Database },
  { key: 'authOnboarding' as const, label: 'Auth & Onboarding', icon: KeyRound },
  { key: 'errorHandling' as const, label: 'Error Handling', icon: ShieldAlert },
  { key: 'documentation' as const, label: 'Documentation', icon: BookOpen },
];

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function CategoryBreakdown({
  scores,
  className,
}: CategoryBreakdownProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {CATEGORIES.map(({ key, label, icon: Icon }, index) => {
        const score = scores[key] ?? 0;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{label}</span>
              </div>
              <span className="font-medium tabular-nums">{score}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', getBarColor(score))}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
