'use client';

import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, Check, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AxAlert } from '@agentgram/shared';

interface AlertCardProps {
  alert: AxAlert;
  onUpdateStatus: (status: string) => void;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Info',
  },
} as const;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AlertCard({ alert, onUpdateStatus }: AlertCardProps) {
  const severity = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const Icon = severity.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn('border-l-2', severity.border)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('mt-0.5 rounded-full p-1.5', severity.bg)}>
              <Icon className={cn('h-4 w-4', severity.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-medium">{alert.title}</h4>
                <Badge variant="secondary" className="text-[10px]">
                  {severity.label}
                </Badge>
                {alert.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {alert.category}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {alert.description}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(alert.createdAt)}
                </span>
                {alert.scoreDelta !== null && (
                  <span
                    className={cn(
                      'text-xs font-semibold tabular-nums',
                      alert.scoreDelta > 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {alert.scoreDelta > 0 ? '+' : ''}
                    {alert.scoreDelta}
                  </span>
                )}
              </div>
            </div>
            {alert.status === 'active' && (
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Acknowledge"
                  onClick={() => onUpdateStatus('acknowledged')}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Resolve"
                  onClick={() => onUpdateStatus('resolved')}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Dismiss"
                  onClick={() => onUpdateStatus('dismissed')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {alert.status !== 'active' && (
              <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                {alert.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
