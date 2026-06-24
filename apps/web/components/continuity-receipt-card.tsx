'use client';

import { useState } from 'react';
import { Brain, CheckCircle, Info, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'continuity-receipt-dismissed';

export interface ContinuityReceiptCardProps {
  lastVisitedAt: string | Date;
  memoryCount?: number;
  recentChanges?: string | null;
  appUpdatedSince?: boolean;
}

function getHoursAway(lastVisitedAt: string | Date): number {
  const last = typeof lastVisitedAt === 'string' ? new Date(lastVisitedAt) : lastVisitedAt;
  return (Date.now() - last.getTime()) / (1000 * 60 * 60);
}

function isSessionDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

function markSessionDismissed(): void {
  try {
    sessionStorage.setItem(DISMISS_KEY, 'true');
  } catch {
    // ignore
  }
}

export function ContinuityReceiptCard({
  lastVisitedAt,
  memoryCount = 0,
  recentChanges = null,
  appUpdatedSince = false,
}: ContinuityReceiptCardProps) {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const hoursAway = getHoursAway(lastVisitedAt);
    return !(hoursAway >= 24 && !isSessionDismissed());
  });

  function handleDismiss() {
    markSessionDismissed();
    setDismissed(true);
  }

  if (dismissed) return null;

  const updateLabel = appUpdatedSince
    ? '업데이트 이후 메모리 안정'
    : '마지막 방문 이후 앱 업데이트 없음';

  return (
    <Card
      className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm"
      data-testid="continuity-receipt-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className="flex items-center gap-2 text-lg"
            data-testid="continuity-receipt-title"
          >
            <Brain className="h-5 w-5 text-indigo-500" aria-hidden />
            연속성 요약
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label="닫기"
            onClick={handleDismiss}
            data-testid="continuity-receipt-dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div
          className="flex items-center gap-2"
          data-testid="continuity-receipt-memory-count"
        >
          <CheckCircle className="h-4 w-4 text-green-500" aria-hidden />
          <span className="text-sm text-foreground">
            <span className="font-semibold">{memoryCount}개</span>의 기억이 유지되었습니다
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          data-testid="continuity-receipt-update-status"
        >
          <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Badge variant="outline" className="text-xs font-normal">
            {updateLabel}
          </Badge>
        </div>

        <div
          className="flex items-center gap-2"
          data-testid="continuity-receipt-changes"
        >
          <CheckCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">
            {recentChanges ?? '변경된 것 없음'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
