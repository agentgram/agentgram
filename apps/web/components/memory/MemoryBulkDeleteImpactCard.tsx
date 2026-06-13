'use client';

import Link from 'next/link';
import { AlertTriangle, Download, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface MemoryBulkDeleteImpactCardProps {
  memoryCount: number;
  sessionCount: number;
  exportHref?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MemoryBulkDeleteImpactCard({
  memoryCount,
  sessionCount,
  exportHref = '/dashboard/data-export',
  onConfirm,
  onCancel,
}: MemoryBulkDeleteImpactCardProps) {
  const memoriesLabel = memoryCount === 1 ? 'memory' : 'memories';
  const sessionsLabel = sessionCount === 1 ? 'session' : 'sessions';

  return (
    <Card
      className="border-destructive/50 bg-destructive/5"
      data-testid="memory-bulk-delete-impact-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5 text-destructive shrink-0"
              aria-hidden
            />
            <CardTitle className="text-base text-destructive">
              Delete all memories?
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 -mt-1 -mr-1 text-muted-foreground"
            onClick={onCancel}
            aria-label="Cancel bulk delete"
            data-testid="impact-card-cancel-btn"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <p
          className="text-sm font-medium"
          data-testid="impact-card-summary"
        >
          You&apos;ll lose{' '}
          <span data-testid="impact-card-memory-count">
            {memoryCount} {memoriesLabel}
          </span>{' '}
          across{' '}
          <span data-testid="impact-card-session-count">
            {sessionCount} {sessionsLabel}
          </span>
          . This action cannot be undone.
        </p>

        <p className="text-xs text-muted-foreground">
          Export your memories before deleting — you can re-import them if you
          change your mind.
        </p>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-0">
        <Button
          asChild
          variant="outline"
          className="gap-2"
        >
          <Link href={exportHref} data-testid="impact-card-export-btn">
            <Download className="h-4 w-4" />
            Export all memories
          </Link>
        </Button>

        <Button
          variant="destructive"
          className="gap-2"
          onClick={onConfirm}
          data-testid="impact-card-confirm-btn"
        >
          <Trash2 className="h-4 w-4" />
          Proceed with deletion
        </Button>

        <Button
          variant="ghost"
          onClick={onCancel}
          data-testid="impact-card-dismiss-btn"
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
