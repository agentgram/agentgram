'use client';

import { useMemo, useState } from 'react';
import { History, Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import { CONTENT_LIMITS } from '@agentgram/shared';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type EditableSnapshot = {
  displayName: string;
  description: string;
  backstory: string;
};

type DigestField = {
  key: keyof EditableSnapshot;
  label: string;
  trustNote: string;
  changeType: 'added' | 'updated' | 'cleared';
  previousValue: string;
  nextValue: string;
};

type SaveResponse = {
  success?: boolean;
  data?: {
    digest: {
      changedFields: DigestField[];
      summary: string;
      recordedAt: string;
    };
    rollbackSnapshot: EditableSnapshot;
    snapshot: EditableSnapshot;
  };
  error?: {
    message?: string;
  };
};

type MemoryDigest = NonNullable<SaveResponse['data']>['digest'];

export interface AgentMemoryTrustSettings {
  agentId: string;
  agentName: string;
  agentLabel: string;
  personaName?: string;
  initialSnapshot: EditableSnapshot;
}

interface AgentMemoryTrustFormProps {
  settings: AgentMemoryTrustSettings;
}

function normalizeSnapshot(snapshot: EditableSnapshot): EditableSnapshot {
  return {
    displayName: snapshot.displayName.trim(),
    description: snapshot.description.trim(),
    backstory: snapshot.backstory.trim(),
  };
}

function snapshotsEqual(
  left: EditableSnapshot,
  right: EditableSnapshot
): boolean {
  const a = normalizeSnapshot(left);
  const b = normalizeSnapshot(right);

  return (
    a.displayName === b.displayName &&
    a.description === b.description &&
    a.backstory === b.backstory
  );
}

function formatRecordedAt(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function FieldCount({ current, max }: { current: number; max: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {current}/{max}
    </span>
  );
}

export function AgentMemoryTrustForm({ settings }: AgentMemoryTrustFormProps) {
  const [form, setForm] = useState(settings.initialSnapshot);
  const [lastSaved, setLastSaved] = useState(settings.initialSnapshot);
  const [rollbackSnapshot, setRollbackSnapshot] =
    useState<EditableSnapshot | null>(null);
  const [digest, setDigest] = useState<MemoryDigest | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({
    tone: 'idle',
    message: '',
  });

  const hasUnsavedChanges = useMemo(
    () => !snapshotsEqual(form, lastSaved),
    [form, lastSaved]
  );

  async function persistSnapshot(
    snapshot: EditableSnapshot,
    source: 'save' | 'rollback'
  ) {
    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/v1/developers/me/agent-memory-trust', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: settings.agentId,
          ...snapshot,
        }),
      });

      const payload = (await response.json()) as SaveResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.error?.message ||
            'Could not save profile memory settings. Please try again.'
        );
      }

      setForm(payload.data.snapshot);
      setLastSaved(payload.data.snapshot);
      setRollbackSnapshot(payload.data.rollbackSnapshot);
      setDigest(payload.data.digest);
      setStatus({
        tone: 'success',
        message:
          source === 'rollback'
            ? 'Previous profile memory snapshot restored.'
            : 'Profile memory settings saved.',
      });
    } catch (error) {
      console.error('Error saving profile memory settings:', error);
      setStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not save profile memory settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      setStatus({
        tone: 'success',
        message: 'No new profile memory changes to save.',
      });
      return;
    }

    await persistSnapshot(form, 'save');
  };

  const handleRollback = async () => {
    if (!rollbackSnapshot) return;
    await persistSnapshot(rollbackSnapshot, 'rollback');
  };

  const canRollback =
    rollbackSnapshot != null && !snapshotsEqual(rollbackSnapshot, lastSaved);

  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      id={'memory-trust-' + settings.agentId}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Memory trust for {settings.agentLabel}
        </CardTitle>
        <CardDescription>
          Edit the public profile summary and active backstory together, then
          review a recent-memory-change digest before moving on.
        </CardDescription>
        <p className="text-sm text-muted-foreground">
          Agent slug:{' '}
          <span className="font-mono text-foreground">
            {settings.agentName}
          </span>
          {settings.personaName ? (
            <>
              {' '}
              · Active persona:{' '}
              <span className="font-medium text-foreground">
                {settings.personaName}
              </span>
            </>
          ) : (
            <>
              {' '}
              · No active persona yet, so only the public profile fields are
              editable here.
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <label className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground">
                Display name
              </span>
              <FieldCount
                current={form.displayName.length}
                max={CONTENT_LIMITS.DISPLAY_NAME_MAX}
              />
            </div>
            <input
              aria-label={`Display name for ${settings.agentLabel}`}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={CONTENT_LIMITS.DISPLAY_NAME_MAX}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
              placeholder="Readable public label"
              value={form.displayName}
            />
          </label>

          <label className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground">
                Profile summary
              </span>
              <FieldCount
                current={form.description.length}
                max={CONTENT_LIMITS.DESCRIPTION_MAX}
              />
            </div>
            <textarea
              aria-label={`Profile summary for ${settings.agentLabel}`}
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={CONTENT_LIMITS.DESCRIPTION_MAX}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Short public profile summary"
              value={form.description}
            />
          </label>

          <label className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground">
                Active backstory
              </span>
              <FieldCount
                current={form.backstory.length}
                max={CONTENT_LIMITS.PERSONA_BACKSTORY_MAX}
              />
            </div>
            <textarea
              aria-label={`Active backstory for ${settings.agentLabel}`}
              className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!settings.personaName}
              maxLength={CONTENT_LIMITS.PERSONA_BACKSTORY_MAX}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  backstory: event.target.value,
                }))
              }
              placeholder="Private pinned backstory for the active persona"
              value={form.backstory}
            />
          </label>
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
            'Saving updates both the visible profile summary and the memory-trust digest.'}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={isSaving} onClick={handleSave} type="button">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving memory trust
              </>
            ) : (
              'Save profile memory'
            )}
          </Button>
          {canRollback ? (
            <Button
              disabled={isSaving}
              onClick={handleRollback}
              type="button"
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Roll back previous snapshot
            </Button>
          ) : null}
          {hasUnsavedChanges ? (
            <span className="text-sm text-muted-foreground">
              Unsaved changes pending review.
            </span>
          ) : null}
        </div>

        {digest ? (
          <div
            className="rounded-xl border border-primary/20 bg-primary/5 p-4"
            data-testid={`memory-digest-${settings.agentId}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <History className="h-4 w-4 text-primary" />
                  Recent memory change digest
                </div>
                <p className="text-sm text-muted-foreground">
                  {digest.summary}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRecordedAt(digest.recordedAt)}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {digest.changedFields.map((field: DigestField) => (
                <div
                  className="rounded-lg border border-border/50 bg-background/80 p-3"
                  key={field.key}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">
                      {field.label}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {field.changeType}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {field.trustNote}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Before
                      </div>
                      <p className="mt-1 text-sm text-foreground">
                        {field.previousValue || 'Empty'}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        After
                      </div>
                      <p className="mt-1 text-sm text-foreground">
                        {field.nextValue || 'Empty'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
