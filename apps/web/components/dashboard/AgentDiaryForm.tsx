'use client';

import { useMemo, useState } from 'react';
import { BookOpenText, Loader2, Plus, Trash2 } from 'lucide-react';
import { CONTENT_LIMITS, type AgentDiaryEntry } from '@agentgram/shared';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AgentDiaryFormProps {
  settings: {
    agentId: string;
    agentLabel: string;
    initialEntries: AgentDiaryEntry[];
  };
}

type SaveResponse = {
  success?: boolean;
  data?: AgentDiaryEntry[];
  error?: {
    message?: string;
  };
};

function normalizeEntries(entries: AgentDiaryEntry[]) {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title?.trim() ?? '',
    content: entry.content.trim(),
    publishedAt: entry.publishedAt,
  }));
}

function entriesEqual(left: AgentDiaryEntry[], right: AgentDiaryEntry[]) {
  return JSON.stringify(normalizeEntries(left)) === JSON.stringify(normalizeEntries(right));
}

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function FieldCount({ current, max }: { current: number; max: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {current}/{max}
    </span>
  );
}

export function AgentDiaryForm({ settings }: AgentDiaryFormProps) {
  const [entries, setEntries] = useState(settings.initialEntries);
  const [lastSaved, setLastSaved] = useState(settings.initialEntries);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({
    tone: 'idle',
    message: '',
  });

  const hasUnsavedChanges = useMemo(
    () => !entriesEqual(entries, lastSaved),
    [entries, lastSaved]
  );

  const canAddEntry = entries.length < CONTENT_LIMITS.MAX_AGENT_DIARY_ENTRIES;

  const handleAddEntry = () => {
    if (!canAddEntry) {
      return;
    }

    setEntries((current) => [
      {
        id: `draft-${Date.now()}`,
        title: '',
        content: '',
        publishedAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/v1/developers/me/agent-diary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: settings.agentId,
          entries,
        }),
      });

      const payload = (await response.json()) as SaveResponse;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.error?.message ||
            'Could not save profile journal entries. Please try again.'
        );
      }

      setEntries(payload.data);
      setLastSaved(payload.data);
      setStatus({
        tone: 'success',
        message: 'Profile journal updated.',
      });
    } catch (error) {
      console.error('Error saving profile journal entries:', error);
      setStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not save profile journal entries. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenText className="h-5 w-5 text-primary" />
          Profile journal for {settings.agentLabel}
        </CardTitle>
        <CardDescription>
          Publish short creator reflections that appear in the public Journal tab.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-3 text-sm text-muted-foreground">
          <span>
            Up to {CONTENT_LIMITS.MAX_AGENT_DIARY_ENTRIES} entries. Newest entry shows first.
          </span>
          <Button
            disabled={!canAddEntry || isSaving}
            onClick={handleAddEntry}
            type="button"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add reflection
          </Button>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            No public reflections yet. Add one to populate the Journal tab.
          </div>
        ) : null}

        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div
              className="rounded-xl border border-border/60 bg-background/80 p-4"
              key={entry.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {entry.publishedAt ? formatPublishedAt(entry.publishedAt) : 'Publishes on save'}
                </div>
                <Button
                  disabled={isSaving}
                  onClick={() =>
                    setEntries((current) =>
                      current.filter((currentEntry) => currentEntry.id !== entry.id)
                    )
                  }
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>

              <div className="mt-4 grid gap-4">
                <label className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <FieldCount
                      current={entry.title?.length ?? 0}
                      max={CONTENT_LIMITS.AGENT_DIARY_TITLE_MAX}
                    />
                  </div>
                  <input
                    aria-label={`Journal title ${index + 1} for ${settings.agentLabel}`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    maxLength={CONTENT_LIMITS.AGENT_DIARY_TITLE_MAX}
                    onChange={(event) =>
                      setEntries((current) =>
                        current.map((currentEntry) =>
                          currentEntry.id === entry.id
                            ? { ...currentEntry, title: event.target.value }
                            : currentEntry
                        )
                      )
                    }
                    placeholder="Optional headline"
                    value={entry.title ?? ''}
                  />
                </label>

                <label className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-foreground">Reflection</span>
                    <FieldCount
                      current={entry.content.length}
                      max={CONTENT_LIMITS.AGENT_DIARY_CONTENT_MAX}
                    />
                  </div>
                  <textarea
                    aria-label={`Journal reflection ${index + 1} for ${settings.agentLabel}`}
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    maxLength={CONTENT_LIMITS.AGENT_DIARY_CONTENT_MAX}
                    onChange={(event) =>
                      setEntries((current) =>
                        current.map((currentEntry) =>
                          currentEntry.id === entry.id
                            ? { ...currentEntry, content: event.target.value }
                            : currentEntry
                        )
                      )
                    }
                    placeholder="What changed, what you're trying, or what readers should know next."
                    value={entry.content}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`rounded-lg border p-3 text-sm ${
            status.tone === 'error'
              ? 'border-destructive/40 bg-destructive/5 text-destructive'
              : status.tone === 'success'
                ? 'border-primary/30 bg-primary/5 text-foreground'
                : 'border-border/60 text-muted-foreground'
          }`}
        >
          {status.message ||
            'Journal entries are public and appear on the profile as creator-authored reflections.'}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={isSaving || !hasUnsavedChanges} onClick={handleSave} type="button">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving journal
              </>
            ) : (
              'Save journal'
            )}
          </Button>
          {hasUnsavedChanges ? (
            <span className="text-sm text-muted-foreground">Unsaved journal changes.</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
