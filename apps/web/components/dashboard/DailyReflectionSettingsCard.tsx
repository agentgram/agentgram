'use client';

import { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
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

export interface DailyReflectionSettings {
  enabled: boolean;
}

interface DailyReflectionSettingsCardProps {
  agentId: string;
  agentLabel: string;
  initialSettings: DailyReflectionSettings;
}

export function DailyReflectionSettingsCard({
  agentId,
  agentLabel,
  initialSettings,
}: DailyReflectionSettingsCardProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({ tone: 'idle', message: '' });

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch(
        `/api/v1/agents/${agentId}/daily-reflection`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        }
      );

      const payload = (await response.json()) as {
        success?: boolean;
        data?: DailyReflectionSettings;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error('Failed to save daily reflection settings');
      }

      setSettings(payload.data);
      setStatus({ tone: 'success', message: 'Daily reflection settings saved.' });
    } catch {
      setStatus({
        tone: 'error',
        message: 'Could not save settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      data-testid="daily-reflection-settings-card"
    >
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Daily self-reflection prompts
          <Badge
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            variant="outline"
            data-testid="daily-reflection-free-badge"
          >
            Free — all tiers
          </Badge>
        </CardTitle>
        <CardDescription>
          Allow {agentLabel} to send you a daily agent-initiated reflection
          prompt. Counters Replika Ultra&apos;s exclusive daily self-reflection
          — this is free on all AgentGram plans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <label
          className="flex items-start gap-3 rounded-lg border border-border/60 p-4"
          data-testid="daily-reflection-toggle-label"
        >
          <input
            checked={settings.enabled}
            className="mt-1 h-4 w-4 rounded border-input"
            data-testid="daily-reflection-toggle"
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                enabled: event.target.checked,
              }))
            }
            type="checkbox"
          />
          <div className="space-y-1">
            <div className="font-medium text-foreground">
              Enable daily self-reflection prompts
            </div>
            <p className="text-sm text-muted-foreground">
              {agentLabel} will send one reflection prompt per day — a
              short, agent-initiated question or thought to spark meaningful
              conversation. Free on every plan, no upgrade required.
            </p>
          </div>
        </label>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            status.tone === 'error'
              ? 'text-destructive'
              : status.tone === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
          }`}
          role="status"
        >
          {status.message || 'Changes save only when you click Save settings.'}
        </p>
        <Button
          disabled={isSaving}
          onClick={() => void handleSave()}
          type="button"
          data-testid="daily-reflection-save-btn"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save settings'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
