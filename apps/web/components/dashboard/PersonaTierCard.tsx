'use client';

import { Zap } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AdultVerifiedPersonaGate } from '@/components/persona/AdultVerifiedPersonaGate';
import type { UserProfile } from '@/lib/minor-safe-mode';
import type { PersonaTier } from '@/lib/persona';

interface PersonaTierCardProps {
  profile: UserProfile;
}

const TIER_LABELS: Record<PersonaTier, { label: string; description: string }> =
  {
    standard: {
      label: 'Standard',
      description: 'Default persona mode — suitable for all audiences.',
    },
    adult_verified: {
      label: 'Adult Verified',
      description:
        'Unlocks bolder persona tones and mature relationship dynamics for verified adults.',
    },
  };

export function PersonaTierCard({ profile }: PersonaTierCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-500" />
          Persona Tier
        </CardTitle>
        <CardDescription>
          Unlock bolder persona modes for your agents. Requires age verification
          to comply with SB&nbsp;243 and the NY AI Companion Law.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AdultVerifiedPersonaGate profile={profile}>
          <div
            className="space-y-3"
            data-testid="persona-tier-options"
          >
            {(Object.keys(TIER_LABELS) as PersonaTier[]).map((tier) => (
              <div
                key={tier}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium">
                    {TIER_LABELS[tier].label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {TIER_LABELS[tier].description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AdultVerifiedPersonaGate>
      </CardContent>
    </Card>
  );
}
