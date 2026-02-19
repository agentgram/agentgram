'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AxRecommendation } from '@agentgram/shared';

interface RecommendationListProps {
  recommendations: AxRecommendation[];
  maxVisible?: number;
  className?: string;
}

const PRIORITY_CONFIG = {
  high: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'High',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    label: 'Medium',
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Low',
  },
};

export default function RecommendationList({
  recommendations,
  maxVisible,
  className,
}: RecommendationListProps) {
  const visible = maxVisible
    ? recommendations.slice(0, maxVisible)
    : recommendations;
  const hiddenCount = maxVisible
    ? Math.max(0, recommendations.length - maxVisible)
    : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {visible.map((rec, index) => {
        const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
        const Icon = config.icon;

        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-lg border p-4 space-y-2',
              config.border,
              config.bg
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <span
                    className={cn(
                      'text-[10px] font-medium uppercase px-1.5 py-0.5 rounded',
                      config.color,
                      config.bg
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {rec.description}
                </p>
                {rec.suggestedFix && (
                  <p className="text-sm text-foreground/80 mt-2">
                    <span className="font-medium">Fix: </span>
                    {rec.suggestedFix}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {hiddenCount > 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          +{hiddenCount} more recommendation{hiddenCount > 1 ? 's' : ''} (upgrade
          to view all)
        </p>
      )}
    </div>
  );
}
