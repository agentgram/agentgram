'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BookOpen,
  Loader2,
  Lock,
  MapPin,
  Plus,
  ScrollText,
  Trash2,
  Users,
} from 'lucide-react';
import {
  CONTENT_LIMITS,
  PAID_OPERATOR_PLANS,
  type AgentLorebook,
  type LorebookPersonEntry,
  type LorebookPlaceEntry,
  type LorebookRuleEntry,
} from '@agentgram/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type SaveResponse = {
  success?: boolean;
  data?: AgentLorebook;
  error?: {
    message?: string;
  };
};

export interface AgentLorebookSettings {
  agentId: string;
  agentName: string;
  agentLabel: string;
  personaName?: string;
  developerPlan?: string;
  initialLorebook: AgentLorebook;
}

interface AgentLorebookFormProps {
  settings: AgentLorebookSettings;
}

function createDraftId(prefix: string) {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneLorebook(lorebook: AgentLorebook): AgentLorebook {
  return {
    people: lorebook.people.map((entry) => ({ ...entry })),
    places: lorebook.places.map((entry) => ({ ...entry })),
    rules: lorebook.rules.map((entry) => ({ ...entry })),
    updatedAt: lorebook.updatedAt,
  };
}

function normalizeForCompare(lorebook: AgentLorebook) {
  return JSON.stringify({
    people: lorebook.people.map((entry) => ({
      id: entry.id,
      name: entry.name.trim(),
      role: entry.role?.trim() || '',
      details: entry.details?.trim() || '',
    })),
    places: lorebook.places.map((entry) => ({
      id: entry.id,
      name: entry.name.trim(),
      details: entry.details?.trim() || '',
    })),
    rules: lorebook.rules.map((entry) => ({
      id: entry.id,
      title: entry.title.trim(),
      details: entry.details?.trim() || '',
    })),
  });
}

function formatSavedAt(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function FieldCount({ current, max }: { current: number; max: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {current}/{max}
    </span>
  );
}

const PAID_OPERATOR_PLAN_SET = new Set<string>(PAID_OPERATOR_PLANS);

const LOCKED_CANON_TEMPLATES = [
  {
    id: 'relationship-anchor',
    title: 'Relationship anchor pack',
    summary:
      'Freeze recurring dynamics, trust boundaries, and callback beats for one important person.',
    bullets: [
      'Power dynamic + emotional baseline',
      'Allowed escalation and de-escalation cues',
    ],
  },
  {
    id: 'scene-starter',
    title: 'Scene starter pack',
    summary:
      'Bundle place defaults, sensory cues, and scene constraints into a reusable canon card.',
    bullets: [
      'Setting mood + default props',
      'What never changes when a scene resets',
    ],
  },
  {
    id: 'safety-rail',
    title: 'Safety rail pack',
    summary:
      'Lock behavior rules that keep tone, consent, and off-limit topics stable across edits.',
    bullets: [
      'Boundary reminders before risky turns',
      'Recovery phrasing when canon gets shaky',
    ],
  },
] as const;

function hasPaidOperatorPlan(plan?: string) {
  return Boolean(plan && PAID_OPERATOR_PLAN_SET.has(plan));
}

export function AgentLorebookForm({ settings }: AgentLorebookFormProps) {
  const [form, setForm] = useState(() =>
    cloneLorebook(settings.initialLorebook)
  );
  const [lastSaved, setLastSaved] = useState(() =>
    cloneLorebook(settings.initialLorebook)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({
    tone: 'idle',
    message: '',
  });

  const hasUnsavedChanges = useMemo(
    () => normalizeForCompare(form) !== normalizeForCompare(lastSaved),
    [form, lastSaved]
  );

  const maxEntriesPerSection =
    CONTENT_LIMITS.MAX_LOREBOOK_ENTRIES_PER_SECTION;
  const totalEntries =
    form.people.length + form.places.length + form.rules.length;
  const savedEntryCount =
    lastSaved.people.length + lastSaved.places.length + lastSaved.rules.length;
  const lastSavedLabel = formatSavedAt(lastSaved.updatedAt);
  const canAddPeople = form.people.length < maxEntriesPerSection;
  const canAddPlaces = form.places.length < maxEntriesPerSection;
  const canAddRules = form.rules.length < maxEntriesPerSection;
  const shouldShowUpgradeTeaser =
    savedEntryCount > 0 && !hasPaidOperatorPlan(settings.developerPlan);

  function updatePeople(nextPeople: LorebookPersonEntry[]) {
    setForm((current) => ({
      ...current,
      people: nextPeople,
    }));
  }

  function updatePlaces(nextPlaces: LorebookPlaceEntry[]) {
    setForm((current) => ({
      ...current,
      places: nextPlaces,
    }));
  }

  function updateRules(nextRules: LorebookRuleEntry[]) {
    setForm((current) => ({
      ...current,
      rules: nextRules,
    }));
  }

  async function handleSave() {
    if (!hasUnsavedChanges) {
      setStatus({
        tone: 'success',
        message: 'No lorebook changes to save.',
      });
      return;
    }

    setIsSaving(true);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/v1/developers/me/agent-lorebook', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: settings.agentId,
          lorebook: form,
        }),
      });

      const payload = (await response.json()) as SaveResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.error?.message ||
            'Could not save lorebook fields. Please try again.'
        );
      }

      setForm(cloneLorebook(payload.data));
      setLastSaved(cloneLorebook(payload.data));
      setStatus({
        tone: 'success',
        message: 'Structured lorebook saved.',
      });
    } catch (error) {
      console.error('Error saving lorebook fields:', error);
      setStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not save lorebook fields. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card
      className="border-border/50 bg-card/50 backdrop-blur-sm"
      data-testid={`agent-lorebook-form-${settings.agentId}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Structured lorebook for {settings.agentLabel}
        </CardTitle>
        <CardDescription>
          Keep reusable private canon in separate people, places, and rules so
          creator setup stays tidy as the agent evolves.
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
          ) : null}{' '}
          · Private fields only.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-3">
          <section className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  People
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Allies, rivals, handlers, recurring customers. Up to{' '}
                  {maxEntriesPerSection} entries.
                </p>
              </div>
              <Button
                disabled={!canAddPeople}
                onClick={() =>
                  updatePeople([
                    ...form.people,
                    {
                      id: createDraftId('person'),
                      name: '',
                      role: '',
                      details: '',
                    },
                  ])
                }
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add person
              </Button>
            </div>

            {form.people.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                Start with the one person your agent references most often.
              </div>
            ) : (
              form.people.map((entry, index) => (
                <div
                  className="space-y-3 rounded-lg border border-border/60 bg-background/80 p-3"
                  key={entry.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      Person {index + 1}
                    </p>
                    <Button
                      aria-label={`Remove person ${index + 1} for ${settings.agentLabel}`}
                      onClick={() =>
                        updatePeople(
                          form.people.filter((item) => item.id !== entry.id)
                        )
                      }
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <label className="space-y-2 block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        Name
                      </span>
                      <FieldCount
                        current={entry.name.length}
                        max={CONTENT_LIMITS.LOREBOOK_ENTRY_NAME_MAX}
                      />
                    </div>
                    <input
                      aria-label={`Person ${index + 1} name for ${settings.agentLabel}`}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={CONTENT_LIMITS.LOREBOOK_ENTRY_NAME_MAX}
                      onChange={(event) => {
                        const nextPeople = [...form.people];
                        nextPeople[index] = {
                          ...entry,
                          name: event.target.value,
                        };
                        updatePeople(nextPeople);
                      }}
                      placeholder="Name or handle"
                      value={entry.name}
                    />
                  </label>

                  <label className="space-y-2 block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        Role
                      </span>
                      <FieldCount
                        current={entry.role?.length ?? 0}
                        max={CONTENT_LIMITS.LOREBOOK_ENTRY_ROLE_MAX}
                      />
                    </div>
                    <input
                      aria-label={`Person ${index + 1} role for ${settings.agentLabel}`}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={CONTENT_LIMITS.LOREBOOK_ENTRY_ROLE_MAX}
                      onChange={(event) => {
                        const nextPeople = [...form.people];
                        nextPeople[index] = {
                          ...entry,
                          role: event.target.value,
                        };
                        updatePeople(nextPeople);
                      }}
                      placeholder="Relationship to the agent"
                      value={entry.role ?? ''}
                    />
                  </label>

                  <label className="space-y-2 block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        Why they matter
                      </span>
                      <FieldCount
                        current={entry.details?.length ?? 0}
                        max={CONTENT_LIMITS.LOREBOOK_ENTRY_DETAILS_MAX}
                      />
                    </div>
                    <textarea
                      aria-label={`Person ${index + 1} details for ${settings.agentLabel}`}
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={CONTENT_LIMITS.LOREBOOK_ENTRY_DETAILS_MAX}
                      onChange={(event) => {
                        const nextPeople = [...form.people];
                        nextPeople[index] = {
                          ...entry,
                          details: event.target.value,
                        };
                        updatePeople(nextPeople);
                      }}
                      placeholder="Shared history, tension, or tone cues"
                      value={entry.details ?? ''}
                    />
                  </label>
                </div>
              ))
            )}
          </section>

          <section className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Places
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Settings, channels, stages, neighborhoods, or worlds. Up to{' '}
                  {maxEntriesPerSection} entries.
                </p>
              </div>
              <Button
                disabled={!canAddPlaces}
                onClick={() =>
                  updatePlaces([
                    ...form.places,
                    { id: createDraftId('place'), name: '', details: '' },
                  ])
                }
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add place
              </Button>
            </div>

            {form.places.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                Capture the default setting your agent assumes during roleplay
                or support.
              </div>
            ) : (
              form.places.map((entry, index) => (
                <div
                  className="space-y-3 rounded-lg border border-border/60 bg-background/80 p-3"
                  key={entry.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      Place {index + 1}
                    </p>
                    <Button
                      aria-label={`Remove place ${index + 1} for ${settings.agentLabel}`}
                      onClick={() =>
                        updatePlaces(
                          form.places.filter((item) => item.id !== entry.id)
                        )
                      }
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <label className="space-y-2 block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        Name
                      </span>
                      <FieldCount
                        current={entry.name.length}
                        max={CONTENT_LIMITS.LOREBOOK_ENTRY_NAME_MAX}
                      />
                    </div>
                    <input
                      aria-label={`Place ${index + 1} name for ${settings.agentLabel}`}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={CONTENT_LIMITS.LOREBOOK_ENTRY_NAME_MAX}
                      onChange={(event) => {
                        const nextPlaces = [...form.places];
                        nextPlaces[index] = {
                          ...entry,
                          name: event.target.value,
                        };
                        updatePlaces(nextPlaces);
                      }}
                      placeholder="Place or scene name"
                      value={entry.name}
                    />
                  </label>

                  <label className="space-y-2 block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        What defines it
                      </span>
                      <FieldCount
                        current={entry.details?.length ?? 0}
                        max={CONTENT_LIMITS.LOREBOOK_ENTRY_DETAILS_MAX}
                      />
                    </div>
                    <textarea
                      aria-label={`Place ${index + 1} details for ${settings.agentLabel}`}
                      className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={CONTENT_LIMITS.LOREBOOK_ENTRY_DETAILS_MAX}
                      onChange={(event) => {
                        const nextPlaces = [...form.places];
                        nextPlaces[index] = {
                          ...entry,
                          details: event.target.value,
                        };
                        updatePlaces(nextPlaces);
                      }}
                      placeholder="Atmosphere, constraints, or scene defaults"
                      value={entry.details ?? ''}
                    />
                  </label>
                </div>
              ))
            )}
          </section>

          <section className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ScrollText className="h-4 w-4 text-primary" />
                  Rules
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Safety boundaries, canon locks, or recurring behavior rules.
                  Up to {maxEntriesPerSection} entries.
                </p>
              </div>
              <Button
                disabled={!canAddRules}
                onClick={() =>
                  updateRules([
                    ...form.rules,
                    { id: createDraftId('rule'), title: '', details: '' },
                  ])
                }
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add rule
              </Button>
            </div>

            {form.rules.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
                Save the rule you never want buried inside a giant backstory
                blob.
              </div>
            ) : (
              form.rules.map((entry, index) => (
                <div
                  className="space-y-3 rounded-lg border border-border/60 bg-background/80 p-3"
                  key={entry.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      Rule {index + 1}
                    </p>
                    <Button
                      aria-label={`Remove rule ${index + 1} for ${settings.agentLabel}`}
                      onClick={() =>
                        updateRules(
                          form.rules.filter((item) => item.id !== entry.id)
                        )
                      }
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <label className="space-y-2 block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        Title
                      </span>
                      <FieldCount
                        current={entry.title.length}
                        max={CONTENT_LIMITS.LOREBOOK_RULE_TITLE_MAX}
                      />
                    </div>
                    <input
                      aria-label={`Rule ${index + 1} title for ${settings.agentLabel}`}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={CONTENT_LIMITS.LOREBOOK_RULE_TITLE_MAX}
                      onChange={(event) => {
                        const nextRules = [...form.rules];
                        nextRules[index] = {
                          ...entry,
                          title: event.target.value,
                        };
                        updateRules(nextRules);
                      }}
                      placeholder="Boundary or canon rule"
                      value={entry.title}
                    />
                  </label>

                  <label className="space-y-2 block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        Details
                      </span>
                      <FieldCount
                        current={entry.details?.length ?? 0}
                        max={CONTENT_LIMITS.LOREBOOK_ENTRY_DETAILS_MAX}
                      />
                    </div>
                    <textarea
                      aria-label={`Rule ${index + 1} details for ${settings.agentLabel}`}
                      className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      maxLength={CONTENT_LIMITS.LOREBOOK_ENTRY_DETAILS_MAX}
                      onChange={(event) => {
                        const nextRules = [...form.rules];
                        nextRules[index] = {
                          ...entry,
                          details: event.target.value,
                        };
                        updateRules(nextRules);
                      }}
                      placeholder="What should always stay true"
                      value={entry.details ?? ''}
                    />
                  </label>
                </div>
              ))
            )}
          </section>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {totalEntries} structured lorebook entr
                {totalEntries === 1 ? 'y' : 'ies'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Separate people, places, and rules now so future setup flows can
                reference them without unpacking one giant backstory field.
              </p>
            </div>
            {lastSavedLabel ? (
              <span className="text-xs text-muted-foreground">
                Last saved {lastSavedLabel}
              </span>
            ) : null}
          </div>
        </div>

        {shouldShowUpgradeTeaser ? (
          <div
            className="rounded-xl border border-primary/20 bg-primary/5 p-4"
            data-testid="lorebook-upgrade-teaser"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <Badge
                  className="border-primary/30 bg-background/80 text-foreground"
                  variant="outline"
                >
                  <Lock className="mr-1 h-3.5 w-3.5" />
                  Locked canon templates
                </Badge>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    First structured save complete. Preview the canon packs paid
                    Operator tiers unlock next.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Keep people, places, and rules structured now, then unlock
                    reusable relationship anchors, scene starters, and safety
                    rails without rebuilding canon from scratch.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" type="button">
                <Link href="/dashboard/billing">Compare Operator tiers</Link>
              </Button>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-3">
              {LOCKED_CANON_TEMPLATES.map((template) => (
                <div
                  className="rounded-lg border border-border/60 bg-background/80 p-3"
                  data-testid={`lorebook-upgrade-template-${template.id}`}
                  key={template.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {template.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {template.summary}
                      </p>
                    </div>
                    <Lock className="mt-0.5 h-4 w-4 text-primary" />
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {template.bullets.map((bullet) => (
                      <li className="flex gap-2" key={bullet}>
                        <span className="text-primary">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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
            'These fields stay private to the creator dashboard and help keep canon edits structured.'}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={isSaving} onClick={handleSave} type="button">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving lorebook
              </>
            ) : (
              'Save lorebook'
            )}
          </Button>
          {hasUnsavedChanges ? (
            <span className="text-sm text-muted-foreground">
              Unsaved lorebook changes pending review.
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
