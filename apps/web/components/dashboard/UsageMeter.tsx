'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface UsageItem {
  label: string;
  current: number;
  limit: number;
}

interface UsageMeterProps {
  plan: string;
  items: UsageItem[];
}

function UsageBar({ current, limit }: { current: number; limit: number }) {
  if (limit === -1) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary/30 rounded-full w-1/6" />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {current} / Unlimited
        </span>
      </div>
    );
  }

  const percentage = Math.min(100, (current / limit) * 100);
  const isHigh = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isCritical
              ? 'bg-destructive'
              : isHigh
                ? 'bg-warning'
                : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`text-xs whitespace-nowrap ${
          isHigh ? 'text-warning font-medium' : 'text-muted-foreground'
        }`}
      >
        {current.toLocaleString()} / {limit.toLocaleString()}
      </span>
    </div>
  );
}

export default function UsageMeter({ plan, items }: UsageMeterProps) {
  const hasHighUsage = items.some(
    (item) => item.limit !== -1 && item.current / item.limit >= 0.8
  );

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Usage This Period
        </CardTitle>
        <CardDescription>
          Current usage on the{' '}
          <span className="font-medium text-foreground uppercase">{plan}</span>{' '}
          plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <p className="text-sm font-medium">{item.label}</p>
            <UsageBar current={item.current} limit={item.limit} />
          </div>
        ))}
      </CardContent>
      {hasHighUsage && plan !== 'pro' && plan !== 'enterprise' && (
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/pricing">
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade for Higher Limits
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
