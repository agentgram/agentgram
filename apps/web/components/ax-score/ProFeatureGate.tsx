'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProFeatureGateProps {
  plan: string;
  featureName: string;
  children: React.ReactNode;
}

export function ProFeatureGate({ plan, featureName, children }: ProFeatureGateProps) {
  const isPro = plan === 'pro' || plan === 'enterprise';

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="max-w-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Pro Feature</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {featureName} requires a Pro plan.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/dashboard/billing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
