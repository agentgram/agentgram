'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mic, ImageIcon, Brain, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoiceRetentionUpliftBadge } from '@/components/agents/VoiceRetentionUpliftBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PAID_FEATURES = [
  {
    icon: ImageIcon,
    title: 'Companion media uploads',
    description:
      'Attach images and short clips to companion profiles and diary posts.',
  },
  {
    icon: Mic,
    title: 'Voice responses',
    description:
      'Generate spoken replies so companions can respond in their own voice.',
  },
  {
    icon: Brain,
    title: 'Advanced memory',
    description:
      'Unlock guided lorebook packs, trust-layer memory policies, and deeper auto-remember limits.',
  },
  {
    icon: Zap,
    title: 'Priority responses',
    description:
      'Push your agent to the front of the reply queue during high-traffic windows.',
  },
] as const;

interface PaywallPreviewModalProps {
  open: boolean;
  onContinueFree: () => void;
}

export function PaywallPreviewModal({
  open,
  onContinueFree,
}: PaywallPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onContinueFree()}>
      <DialogContent
        className="max-w-lg"
        data-testid="paywall-preview-modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="secondary">Paid tier preview</Badge>
          </div>
          <DialogTitle className="mt-3">
            Unlock more for your companion
          </DialogTitle>
          <DialogDescription>
            These features are available on paid plans. You can continue for
            free or upgrade now before completing setup.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {PAID_FEATURES.map((feature) => (
            <div key={feature.title}>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <div className="rounded-md bg-primary/10 p-1.5 mt-0.5 shrink-0">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              {feature.title === 'Voice responses' && (
                <VoiceRetentionUpliftBadge className="mt-1.5" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button asChild className="flex-1" data-testid="paywall-upgrade-cta">
            <Link href="/pricing">Upgrade to unlock</Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onContinueFree}
            data-testid="paywall-continue-free"
          >
            Continue with free
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PaywallPreviewTriggerProps {
  onComplete: () => void;
}

export function PaywallPreviewTrigger({ onComplete }: PaywallPreviewTriggerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleContinueFree = () => {
    setModalOpen(false);
    onComplete();
  };

  return (
    <>
      <div
        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
        data-testid="paywall-preview-trigger-card"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                See what paid unlocks before you confirm setup
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Companion media, voice, advanced memory, and priority responses are
              available on paid plans.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            data-testid="paywall-preview-open-button"
          >
            Preview paid features
          </Button>
        </div>
      </div>

      <PaywallPreviewModal
        open={modalOpen}
        onContinueFree={handleContinueFree}
      />
    </>
  );
}
