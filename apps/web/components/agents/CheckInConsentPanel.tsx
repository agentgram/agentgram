'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  PROACTIVE_TRIGGER_LABELS,
  type ProactiveTriggerSource,
} from '@/lib/proactive-controls';
import {
  ExternalContextLedger,
  type ContextSourceEntry,
} from '@/components/external-context-ledger';

interface CheckInConsentSettings {
  lastAutoMessageTrigger?: ProactiveTriggerSource;
  nextEligibleSendAt?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

interface CheckInConsentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  settings?: CheckInConsentSettings;
  contextSources?: ContextSourceEntry[];
  onAllow: () => void;
  onMute: () => void;
  error?: string | null;
}

function formatNextSendWindow(nextEligibleSendAt?: string): string {
  if (!nextEligibleSendAt) return 'anytime';
  const date = new Date(nextEligibleSendAt);
  if (Number.isNaN(date.getTime())) return 'anytime';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTriggerLabel(trigger?: ProactiveTriggerSource): string {
  if (!trigger) return 'based on your activity';
  return PROACTIVE_TRIGGER_LABELS[trigger].toLowerCase();
}

export function CheckInConsentPanel({
  open,
  onOpenChange,
  agentName,
  settings = {},
  contextSources,
  onAllow,
  onMute,
  error,
}: CheckInConsentPanelProps) {
  const nextWindow = formatNextSendWindow(settings.nextEligibleSendAt);
  const triggerLabel = getTriggerLabel(settings.lastAutoMessageTrigger);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-testid="check-in-consent-panel">
        <DialogHeader>
          <DialogTitle data-testid="check-in-consent-title">
            Allow check-ins from {agentName}?
          </DialogTitle>
          <div
            data-testid="check-in-consent-description"
            className="mt-2 space-y-1.5 text-sm text-muted-foreground"
          >
            <p data-testid="check-in-reason">
              Your agent may check in with you{' '}
              <span className="font-medium text-foreground">{triggerLabel}</span>
              .
            </p>
            <p data-testid="check-in-next-window">
              Next possible message:{' '}
              <span className="font-medium text-foreground">{nextWindow}</span>
            </p>
            {settings.quietHoursEnabled &&
              settings.quietHoursStart &&
              settings.quietHoursEnd && (
                <p className="text-xs" data-testid="check-in-quiet-hours">
                  Quiet hours: {settings.quietHoursStart}–
                  {settings.quietHoursEnd}
                </p>
              )}
          </div>
        </DialogHeader>
        {contextSources !== undefined && (
          <ExternalContextLedger sources={contextSources} className="mt-2" />
        )}
        {error && (
          <p className="text-sm text-destructive" data-testid="check-in-error">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onMute}
            data-testid="check-in-mute-button"
          >
            Mute
          </Button>
          <Button
            type="button"
            onClick={onAllow}
            data-testid="check-in-allow-button"
          >
            Allow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
