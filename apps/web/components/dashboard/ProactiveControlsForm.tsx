'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Clock,
  Loader2,
  Lock,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getNextEligibleSendAt,
  PROACTIVE_TRIGGER_LABELS,
  TONE_PRESETS,
  type ProactiveControlsSettings,
  type TonePreset,
} from '@/lib/proactive-controls';

const TONE_LABELS: Record<TonePreset, { label: string; description: string }> =
  {
    warm: {
      label: 'Warm',
      description: 'Friendly and conversational',
    },
    neutral: {
      label: 'Neutral',
      description: 'Balanced and professional',
    },
    brief: {
      label: 'Brief',
      description: 'Short and to the point',
    },
  };

interface ProactiveControlsFormProps {
  initialSettings: ProactiveControlsSettings;
  developerPlan?: string;
}

function formatStatusTimestamp(value?: string | null): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return `${new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(parsed)} KST`;
}

function formatQuietHoursWindow(start: string, end: string): string {
  return `${start} → ${end} KST`;
}

const PAID_OPERATOR_PLANS = new Set(['starter', 'pro', 'enterprise']);

function hasPaidOperatorPlan(plan?: string) {
  return Boolean(plan && PAID_OPERATOR_PLANS.has(plan));
}

export function ProactiveControlsForm({
  initialSettings,
  developerPlan,
}: ProactiveControlsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [renderedAtMs, setRenderedAtMs] = useState(() => Date.now());
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({
    tone: 'idle',
    message: '',
  });
  const lastAutoMessageLabel = settings.lastAutoMessageAt
    ? formatStatusTimestamp(settings.lastAutoMessageAt)
    : 'No proactive message sent yet';
  const lastAutoMessageTriggerLabel = settings.lastAutoMessageTrigger
    ? PROACTIVE_TRIGGER_LABELS[settings.lastAutoMessageTrigger]
    : null;
  const nextEligibleSendAt = getNextEligibleSendAt(settings);
  const nextEligibleLabel = nextEligibleSendAt
    ? formatStatusTimestamp(nextEligibleSendAt)
    : 'Waiting for opt-in';
  const previewNextEligibleSendAt = getNextEligibleSendAt({
    ...settings,
    optIn: true,
  });
  const previewNextEligibleLabel = previewNextEligibleSendAt
    ? formatStatusTimestamp(previewNextEligibleSendAt)
    : 'As soon as you opt in';
  const quietHoursPreviewLabel = settings.quietHoursEnabled
    ? formatQuietHoursWindow(settings.quietHoursStart, settings.quietHoursEnd)
    : 'Quiet hours are off';
  const nextEligibleSendMs = nextEligibleSendAt
    ? new Date(nextEligibleSendAt).getTime()
    : Number.NaN;
  const isEligibilityDelayed =
    Number.isFinite(nextEligibleSendMs) && nextEligibleSendMs - renderedAtMs > 60 * 1000;
  const updateSettings = (value: Parameters<typeof setSettings>[0]) => {
    setRenderedAtMs(Date.now());
    setSettings(value);
  };
  const isQuietHoursBlocking =
    isEligibilityDelayed && settings.quietHoursEnabled && !settings.nextEligibleSendAt;
  const preSendBannerTitle = !settings.optIn
    ? 'Proactive send blocked until opt-in'
    : isQuietHoursBlocking
      ? 'Next proactive send waits for the reset window'
      : isEligibilityDelayed
        ? 'Next proactive send stays queued until the next eligible window'
        : 'Next proactive send is available once caps allow';
  const preSendBannerBody = !settings.optIn
    ? `Turn on proactive outreach before AgentGram sends the next message. When you do, it will still respect your ${settings.dailyLimit}/day and ${settings.weeklyLimit}/week caps.`
    : isQuietHoursBlocking
      ? `Quiet hours push the next eligible send to ${nextEligibleLabel}. Once that window opens, AgentGram still respects your ${settings.dailyLimit}/day and ${settings.weeklyLimit}/week caps.`
      : isEligibilityDelayed
        ? `AgentGram is still waiting for the next eligible send window at ${nextEligibleLabel}. Daily and weekly usage still stay capped at ${settings.dailyLimit}/day and ${settings.weeklyLimit}/week.`
        : `AgentGram can send again as early as ${nextEligibleLabel}. Daily and weekly usage still stay capped at ${settings.dailyLimit}/day and ${settings.weeklyLimit}/week.`;
  const shouldShowPremiumTruthLabel = !hasPaidOperatorPlan(developerPlan);

  const handleSave = async (
    nextSettings: ProactiveControlsSettings = settings,
    successMessage: string = 'Proactive outreach preferences saved.'
  ) => {
    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/v1/developers/me/proactive-controls', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextSettings),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        data?: ProactiveControlsSettings;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error('Failed to save proactive controls');
      }

      updateSettings(payload.data);
      setStatus({
        tone: 'success',
        message: successMessage,
      });
    } catch (error) {
      console.error('Error saving proactive controls:', error);
      setStatus({
        tone: 'error',
        message: 'Could not save these settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeepMuted = async () => {
    await handleSave(
      {
        ...settings,
        optIn: false,
      },
      'Proactive outreach will stay muted until you opt in.'
    );
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Proactive outreach controls
          {shouldShowPremiumTruthLabel ? (
            <Badge
              className="gap-1 border-primary/20 bg-primary/10 text-primary"
              variant="outline"
            >
              <Lock className="h-3.5 w-3.5" />
              Paid only
            </Badge>
          ) : null}
        </CardTitle>
        <CardDescription>
          Outreach stays off until you explicitly opt in. Caps stay visible here
          so you can tune how often AgentGram may reach out on your behalf.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {shouldShowPremiumTruthLabel ? (
          <div
            className="rounded-xl border border-primary/20 bg-primary/5 p-4"
            data-testid="proactive-premium-truth-label"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Paid Operator tiers unlock proactive outreach scheduling.
                </p>
                <p className="text-sm text-muted-foreground">
                  Free creators should see that send windows, quiet hours, and
                  tone controls belong to the paid proactive layer before they
                  try to turn outreach on.
                </p>
              </div>
              <Link
                className="text-sm font-medium text-primary hover:underline"
                href="/dashboard/billing"
              >
                Compare Operator tiers
              </Link>
            </div>
          </div>
        ) : null}
        <label className="flex items-start gap-3 rounded-lg border border-border/60 p-4">
          <input
            checked={settings.optIn}
            className="mt-1 h-4 w-4 rounded border-input"
            onChange={(event) =>
              updateSettings((current) => ({
                ...current,
                optIn: event.target.checked,
              }))
            }
            type="checkbox"
          />
          <div className="space-y-1">
            <div className="font-medium text-foreground">
              Enable proactive outreach
            </div>
            <p className="text-sm text-muted-foreground">
              Leave this off to keep all proactive outreach disabled by default.
              Turn it on only when you want AgentGram to initiate outreach for
              you.
            </p>
          </div>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              Daily outreach cap
            </span>
            <Input
              aria-label="Daily outreach cap"
              inputMode="numeric"
              min={1}
              max={25}
              onChange={(event) =>
                updateSettings((current) => ({
                  ...current,
                  dailyLimit: Number(event.target.value),
                }))
              }
              type="number"
              value={settings.dailyLimit}
            />
            <p className="text-xs text-muted-foreground">
              Max proactive touches per day when opt-in is enabled.
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              Weekly outreach cap
            </span>
            <Input
              aria-label="Weekly outreach cap"
              inputMode="numeric"
              min={1}
              max={100}
              onChange={(event) =>
                updateSettings((current) => ({
                  ...current,
                  weeklyLimit: Number(event.target.value),
                }))
              }
              type="number"
              value={settings.weeklyLimit}
            />
            <p className="text-xs text-muted-foreground">
              Max proactive touches per rolling week when opt-in is enabled.
            </p>
          </label>
        </div>

        <div className="space-y-4 rounded-lg border border-border/60 p-4">
          <label className="flex items-start gap-3">
            <input
              checked={settings.quietHoursEnabled}
              className="mt-1 h-4 w-4 rounded border-input"
              onChange={(event) =>
                updateSettings((current) => ({
                  ...current,
                  quietHoursEnabled: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Quiet hours
              </div>
              <p className="text-sm text-muted-foreground">
                Pause all proactive outreach during a daily window. Outreach
                resumes automatically once quiet hours end.
              </p>
            </div>
          </label>

          {settings.quietHoursEnabled && (
            <div className="grid gap-4 pl-7 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Start time
                </span>
                <Input
                  aria-label="Quiet hours start"
                  onChange={(event) =>
                    updateSettings((current) => ({
                      ...current,
                      quietHoursStart: event.target.value,
                    }))
                  }
                  type="time"
                  value={settings.quietHoursStart}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  End time
                </span>
                <Input
                  aria-label="Quiet hours end"
                  onChange={(event) =>
                    updateSettings((current) => ({
                      ...current,
                      quietHoursEnd: event.target.value,
                    }))
                  }
                  type="time"
                  value={settings.quietHoursEnd}
                />
              </label>
            </div>
          )}
        </div>

        <fieldset className="space-y-3 rounded-lg border border-border/60 p-4">
          <legend className="flex items-center gap-2 px-1 font-medium text-foreground">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Tone preset
          </legend>
          <p className="text-sm text-muted-foreground">
            Choose the default tone for proactive outreach messages.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {TONE_PRESETS.map((preset) => (
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  settings.tonePreset === preset
                    ? 'border-primary bg-primary/5'
                    : 'border-border/60 hover:border-border'
                }`}
                key={preset}
              >
                <input
                  checked={settings.tonePreset === preset}
                  className="mt-0.5 h-4 w-4"
                  name="tonePreset"
                  onChange={() =>
                    updateSettings((current) => ({
                      ...current,
                      tonePreset: preset,
                    }))
                  }
                  type="radio"
                  value={preset}
                />
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">
                    {TONE_LABELS[preset].label}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {TONE_LABELS[preset].description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {!settings.optIn && (
          <div
            className="rounded-lg border border-border/60 bg-muted/20 p-4"
            data-testid="proactive-opt-in-preview"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                  Preview before you opt in
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quiet hours and the first send window stay visible before you enable outreach, and you can keep everything muted with one click.
                </p>
              </div>
              <Button
                disabled={isSaving}
                onClick={handleKeepMuted}
                size="sm"
                type="button"
                variant="outline"
              >
                Keep muted
              </Button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Quiet hours preview
                </p>
                <p
                  className="mt-2 text-sm font-medium text-foreground"
                  data-testid="proactive-preview-quiet-hours"
                >
                  {quietHoursPreviewLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {settings.quietHoursEnabled
                    ? 'AgentGram will hold outbound check-ins until this daily window ends.'
                    : 'Set a quiet-hours window now if you want outreach to wait until a safer time.'}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  First send window
                </p>
                <p
                  className="mt-2 text-sm font-medium text-foreground"
                  data-testid="proactive-preview-next-window"
                >
                  {previewNextEligibleLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This is the earliest proactive check-in window AgentGram will use once you opt in.
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="rounded-lg border border-primary/20 bg-primary/5 p-4"
          data-testid="proactive-pre-send-banner"
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide text-primary"
            data-testid="proactive-pre-send-banner-title"
          >
            {preSendBannerTitle}
          </p>
          <p
            className="mt-2 text-sm text-foreground"
            data-testid="proactive-pre-send-banner-body"
          >
            {preSendBannerBody}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Last proactive send
            </p>
            <p
              className="mt-2 text-sm font-medium text-foreground"
              data-testid="proactive-last-auto-message"
            >
              {lastAutoMessageLabel}
            </p>
            {lastAutoMessageTriggerLabel && (
              <p
                className="mt-1 text-xs font-medium text-primary/80"
                data-testid="proactive-last-auto-message-trigger"
              >
                {lastAutoMessageTriggerLabel}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {settings.lastAutoMessageAt
                ? 'Updated from the latest outbound proactive message metadata.'
                : 'We will surface the most recent outbound proactive message here once one is delivered.'}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Next eligible send window
            </p>
            <p
              className="mt-2 text-sm font-medium text-foreground"
              data-testid="proactive-next-eligible-send"
            >
              {nextEligibleLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {!settings.optIn
                ? 'Enable proactive outreach before AgentGram schedules the next send window.'
                : settings.quietHoursEnabled
                  ? 'Quiet hours still gate delivery; once they end, daily and weekly caps apply as usual.'
                  : 'Outside quiet hours, the next slot is available as soon as your daily and weekly caps allow.'}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          The caps, quiet hours, and tone preset are enforced after save. If
          values fall outside the allowed range, AgentGram will clamp them to
          safe limits and reflect the saved values back here.
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            status.tone === 'error'
              ? 'text-destructive'
              : status.tone === 'success'
                ? 'text-primary'
                : 'text-muted-foreground'
          }`}
          role="status"
        >
          {status.message || 'Changes save only when you click Save controls.'}
        </p>
        <Button disabled={isSaving} onClick={() => void handleSave()} type="button">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save controls'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
