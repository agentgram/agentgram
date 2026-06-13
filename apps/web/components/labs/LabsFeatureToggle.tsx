'use client';

import { useEffect, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LabsFeatureToggleProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isPaidFeature: boolean;
  isPaidTier: boolean;
  defaultEnabled?: boolean;
}

function getStorageKey(id: string) {
  return `agentgram:labs-flag-${id}`;
}

export function LabsFeatureToggle({
  id,
  title,
  description,
  icon: Icon,
  isPaidFeature,
  isPaidTier,
  defaultEnabled = false,
}: LabsFeatureToggleProps) {
  const locked = isPaidFeature && !isPaidTier;
  const [enabled, setEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(id));
      return stored !== null ? stored === 'true' : defaultEnabled;
    } catch {
      return defaultEnabled;
    }
  });

  useEffect(() => {
    if (!locked) {
      try {
        localStorage.setItem(getStorageKey(id), String(enabled));
      } catch {
        // storage unavailable (SSR, private browsing)
      }
    }
  }, [id, enabled, locked]);

  return (
    <div
      className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4 backdrop-blur-sm"
      data-testid={`labs-feature-toggle-${id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="text-sm font-semibold text-foreground"
                data-testid={`labs-feature-toggle-${id}-title`}
              >
                {title}
              </p>
              {isPaidFeature && (
                <Badge
                  variant="secondary"
                  data-testid={`labs-feature-toggle-${id}-paid-badge`}
                >
                  Paid
                </Badge>
              )}
              {locked && (
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                  data-testid={`labs-feature-toggle-${id}-locked-badge`}
                >
                  <Lock className="mr-1 h-3 w-3" aria-hidden="true" />
                  Locked
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <button
          role="switch"
          aria-checked={locked ? false : enabled}
          aria-label={`Toggle ${title}`}
          disabled={locked}
          onClick={() => !locked && setEnabled((prev) => !prev)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            locked
              ? 'cursor-not-allowed bg-muted opacity-50'
              : enabled
                ? 'bg-primary cursor-pointer'
                : 'bg-muted cursor-pointer'
          }`}
          data-testid={`labs-feature-toggle-${id}-switch`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              !locked && enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {locked && (
        <div
          className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between gap-3"
          data-testid={`labs-feature-toggle-${id}-upgrade-cta`}
        >
          <p className="text-xs text-muted-foreground">
            Upgrade to a paid plan to unlock this experimental feature.
          </p>
          <Button asChild size="sm" variant="default" className="shrink-0">
            <Link href="/pricing" data-testid={`labs-feature-toggle-${id}-upgrade-button`}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Upgrade
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
