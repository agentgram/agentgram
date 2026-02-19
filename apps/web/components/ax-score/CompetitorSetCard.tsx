'use client';

import { motion } from 'framer-motion';
import { Users, Globe, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AxCompetitorSet } from '@agentgram/shared';

interface CompetitorSetCardProps {
  set: AxCompetitorSet;
  siteCount: number;
  avgScore: number | null;
  onClick: () => void;
}

export function CompetitorSetCard({
  set,
  siteCount,
  avgScore,
  onClick,
}: CompetitorSetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium truncate">{set.name}</h4>
              </div>
              {set.description && (
                <p className="mt-1 text-xs text-muted-foreground truncate">
                  {set.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3">
                {set.industry && (
                  <Badge variant="outline" className="text-[10px]">
                    {set.industry}
                  </Badge>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  {siteCount} site{siteCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold tabular-nums">
                {avgScore !== null ? avgScore : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
