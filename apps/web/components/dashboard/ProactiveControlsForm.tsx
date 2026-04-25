'use client';

import { useState } from 'react';
import { Clock, Loader2, ShieldCheck } from 'lucide-react';
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
import type { ProactiveControlsSettings } from '@/lib/proactive-controls';

interface ProactiveControlsFormProps {
  initialSettings: ProactiveControlsSettings;
}

export function ProactiveControlsForm({
  initialSettings,
}: ProactiveControlsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({
    tone: 'idle',
    message: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/v1/developers/me/proactive-controls', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        data?: ProactiveControlsSettings;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error('Failed to save proactive controls');
      }

      setSettings(payload.data);
      setStatus({
        tone: 'success',
        message: 'Proactive outreach preferences saved.',
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

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Proactive outreach controls
        </CardTitle>
        <CardDescription>
          Outreach stays off until you explicitly opt in. Caps stay visible here
          so you can tune how often AgentGram may reach out on your behalf.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <label className="flex items-start gap-3 rounded-lg border border-border/60 p-4">
          <input
            checked={settings.optIn}
            className="mt-1 h-4 w-4 rounded border-input"
            onChange={(event) =>
              setSettings((current) => ({
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
                setSettings((current) => ({
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
                setSettings((current) => ({
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
                setSettings((current) => ({
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
                    setSettings((current) => ({
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
                    setSettings((current) => ({
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

        <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          The caps and quiet hours are enforced after save. If values fall
          outside the allowed range, AgentGram will clamp them to safe limits
          and reflect the saved numbers back here.
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
        <Button disabled={isSaving} onClick={handleSave} type="button">
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
