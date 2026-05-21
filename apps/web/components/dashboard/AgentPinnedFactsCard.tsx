'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  Pin,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const MEMORY_CATEGORIES = ['profile_fact', 'relationship_context'] as const;
type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

export interface AgentPinnedFactRecord {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
  createdAt?: string;
  isPublic?: boolean;
  originLabel: string;
  originSnippet: string;
}

export interface AgentPinnedFactsLedger {
  capacity: number;
  savedCount: number;
  remainingCount: number;
  categoryCounts: {
    profileFact: number;
    relationshipContext: number;
  };
}

export interface AgentPinnedFactsSettings {
  agentId: string;
  agentLabel: string;
  facts: AgentPinnedFactRecord[];
  ledger: AgentPinnedFactsLedger;
}

interface AgentPinnedFactsCardProps {
  settings: AgentPinnedFactsSettings;
}

type MemoryDraft = {
  key: string;
  value: string;
  category: MemoryCategory;
  isPublic: boolean;
};

type MemoryApiRecord = {
  id: string;
  key: string;
  value: string;
  category: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
};

type MemoryApiResponse = {
  success?: boolean;
  data?: MemoryApiRecord;
  error?: {
    message?: string;
  };
};

const EMPTY_DRAFT: MemoryDraft = {
  key: '',
  value: '',
  category: 'profile_fact',
  isPublic: false,
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatFactLabel(key: string) {
  const normalized = key.startsWith('pinned_') ? key.slice(7) : key;

  return normalized
    .split('_')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatCategoryLabel(category: string) {
  return category
    .split('_')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

function formatCapacityCopy(count: number) {
  return count === 1 ? '1 slot left' : `${count} slots left`;
}

function getRecallHealth({
  facts,
  ledger,
}: {
  facts: AgentPinnedFactRecord[];
  ledger: AgentPinnedFactsLedger;
}) {
  if (facts.length === 0) {
    return {
      label: 'No recall history',
      description:
        'Save the first fact before relying on this agent to recall private context.',
      icon: AlertCircle,
      className: 'border-border/70 bg-background text-muted-foreground',
    };
  }

  if (
    ledger.categoryCounts.profileFact === 0 ||
    ledger.categoryCounts.relationshipContext === 0
  ) {
    return {
      label: 'Re-sync recommended',
      description:
        'Review profile facts and relationship context together before the next important chat.',
      icon: AlertCircle,
      className:
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    };
  }

  return {
    label: 'Recall ready',
    description:
      'Profile facts and relationship context both have saved evidence in the ledger.',
    icon: CheckCircle2,
    className: 'border-primary/20 bg-primary/10 text-primary',
  };
}

function isMemoryCategory(value: string): value is MemoryCategory {
  return (MEMORY_CATEGORIES as readonly string[]).includes(value);
}

function truncateSnippet(value: string, max = 140) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max).trimEnd()}...`;
}

function buildLedger(
  facts: AgentPinnedFactRecord[],
  capacity: number
): AgentPinnedFactsLedger {
  return {
    capacity,
    savedCount: facts.length,
    remainingCount: Math.max(capacity - facts.length, 0),
    categoryCounts: {
      profileFact: facts.filter((fact) => fact.category === 'profile_fact')
        .length,
      relationshipContext: facts.filter(
        (fact) => fact.category === 'relationship_context'
      ).length,
    },
  };
}

function sortFacts(facts: AgentPinnedFactRecord[]) {
  return [...facts].sort((left, right) => {
    const leftDate = new Date(left.updatedAt).getTime();
    const rightDate = new Date(right.updatedAt).getTime();

    return rightDate - leftDate;
  });
}

function toPinnedFact(
  record: MemoryApiRecord,
  fallback?: AgentPinnedFactRecord
): AgentPinnedFactRecord {
  const updatedAt =
    record.updated_at ||
    record.created_at ||
    fallback?.updatedAt ||
    new Date().toISOString();

  return {
    id: record.id,
    key: record.key,
    value: record.value,
    category: record.category,
    createdAt: record.created_at || fallback?.createdAt,
    updatedAt,
    isPublic: record.is_public ?? fallback?.isPublic ?? false,
    originLabel: fallback?.originLabel ?? 'Manual memory control',
    originSnippet: fallback?.originSnippet ?? truncateSnippet(record.value),
  };
}

function draftFromFact(fact: AgentPinnedFactRecord): MemoryDraft {
  return {
    key: fact.key,
    value: fact.value,
    category: isMemoryCategory(fact.category) ? fact.category : 'profile_fact',
    isPublic: fact.isPublic ?? false,
  };
}

function parseMemoryPayload(response: Response): Promise<MemoryApiResponse> {
  if (response.status === 204) {
    return Promise.resolve({ success: true });
  }

  return response.json() as Promise<MemoryApiResponse>;
}

export function AgentPinnedFactsCard({ settings }: AgentPinnedFactsCardProps) {
  const [facts, setFacts] = useState(() => sortFacts(settings.facts));
  const [draft, setDraft] = useState<MemoryDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MemoryDraft | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({ tone: 'idle', message: '' });

  const ledger = useMemo(
    () => buildLedger(facts, settings.ledger.capacity),
    [facts, settings.ledger.capacity]
  );
  const recentFacts = facts.slice(0, 3);
  const recallHealth = getRecallHealth({ facts, ledger });
  const RecallHealthIcon = recallHealth.icon;
  const reSyncHref = '#memory-trust-' + settings.agentId;
  const usagePercent =
    ledger.capacity === 0
      ? 0
      : Math.min(100, Math.round((ledger.savedCount / ledger.capacity) * 100));
  const canRemember =
    draft.key.trim().length > 0 &&
    draft.value.trim().length > 0 &&
    ledger.remainingCount > 0;
  const editFact = editingId
    ? (facts.find((fact) => fact.id === editingId) ?? null)
    : null;

  async function handleRemember() {
    if (!canRemember) return;

    setBusyAction('remember');
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch('/api/v1/developers/me/agent-memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: settings.agentId,
          key: draft.key,
          value: draft.value,
          category: draft.category,
          isPublic: draft.isPublic,
        }),
      });
      const payload = await parseMemoryPayload(response);

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.error?.message || 'Could not remember this memory.'
        );
      }

      const savedMemory = payload.data;
      setFacts((current) => sortFacts([toPinnedFact(savedMemory), ...current]));
      setDraft(EMPTY_DRAFT);
      setStatus({ tone: 'success', message: 'Memory remembered.' });
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Could not remember this memory.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSaveEdit() {
    if (!editingId || !editDraft || !editFact) return;

    setBusyAction(`edit-${editingId}`);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch(
        `/api/v1/developers/me/agent-memories/${editingId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: settings.agentId,
            key: editDraft.key,
            value: editDraft.value,
            category: editDraft.category,
            isPublic: editDraft.isPublic,
          }),
        }
      );
      const payload = await parseMemoryPayload(response);

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message || 'Could not edit memory.');
      }

      const updatedMemory = payload.data;
      const updatedFact = toPinnedFact(updatedMemory, editFact);
      setFacts((current) =>
        sortFacts(
          current.map((fact) =>
            fact.id === updatedFact.id ? updatedFact : fact
          )
        )
      );
      setEditingId(null);
      setEditDraft(null);
      setStatus({ tone: 'success', message: 'Memory updated.' });
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Could not edit memory.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleForget(fact: AgentPinnedFactRecord) {
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm(`Forget ${formatFactLabel(fact.key)}?`);

    if (!confirmed) return;

    setBusyAction(`forget-${fact.id}`);
    setStatus({ tone: 'idle', message: '' });

    try {
      const response = await fetch(
        `/api/v1/developers/me/agent-memories/${fact.id}?agentId=${encodeURIComponent(
          settings.agentId
        )}`,
        { method: 'DELETE' }
      );
      const payload = await parseMemoryPayload(response);

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || 'Could not forget memory.');
      }

      setFacts((current) => current.filter((item) => item.id !== fact.id));
      if (editingId === fact.id) {
        setEditingId(null);
        setEditDraft(null);
      }
      setStatus({ tone: 'success', message: 'Memory forgotten.' });
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Could not forget memory.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  function beginEdit(fact: AgentPinnedFactRecord) {
    setEditingId(fact.id);
    setEditDraft(draftFromFact(fact));
    setStatus({ tone: 'idle', message: '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className="h-5 w-5 text-primary" />
          Pinned facts for {settings.agentLabel}
        </CardTitle>
        <CardDescription>
          Visible, controllable private memory. Review what this agent saved,
          remember a new fact, edit stale details, or forget facts that should
          no longer shape future chats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="rounded-xl border border-primary/20 bg-primary/5 p-4"
          data-testid="pinned-facts-ledger-summary"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">
                {ledger.savedCount === 1
                  ? '1 saved memory'
                  : `${ledger.savedCount} saved memories`}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCapacityCopy(ledger.remainingCount)} before this panel
                reaches its current {ledger.capacity}-memory capacity.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ' +
                  recallHealth.className
                }
                data-testid="memory-health-status-badge"
              >
                <RecallHealthIcon className="h-3.5 w-3.5" />
                {recallHealth.label}
              </div>
              <div className="rounded-full border border-primary/20 bg-background/90 px-3 py-1 text-xs font-medium text-primary">
                {usagePercent}% used
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 p-3">
            <p
              className="text-sm text-muted-foreground"
              data-testid="memory-health-status-copy"
            >
              {recallHealth.description}
            </p>
            <a
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 hover:text-primary/80"
              data-testid="memory-resync-cta"
              href={reSyncHref}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Re-sync memory
            </a>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              aria-hidden="true"
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-lg border border-border/60 bg-background/80 p-3"
              data-testid="ledger-category-profile-fact"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Profile fact
              </div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {ledger.categoryCounts.profileFact}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Identity, backstory, and other durable self facts.
              </p>
            </div>

            <div
              className="rounded-lg border border-border/60 bg-background/80 p-3"
              data-testid="ledger-category-relationship-context"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Relationship context
              </div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {ledger.categoryCounts.relationshipContext}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Repeated cues about how this agent should relate to specific
                people.
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border border-border/60 bg-background/80 p-4"
          data-testid="memory-remember-form"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-foreground">Remember memory</div>
              <p className="text-sm text-muted-foreground">
                Add one durable fact to this agent&apos;s private memory ledger.
              </p>
            </div>
            <div className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
              {formatCapacityCopy(ledger.remainingCount)}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Memory key
              </span>
              <Input
                aria-label={`New memory key for ${settings.agentLabel}`}
                maxLength={128}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    key: event.target.value,
                  }))
                }
                placeholder="favorite_release_window"
                value={draft.key}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Category
              </span>
              <select
                aria-label={`New memory category for ${settings.agentLabel}`}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value as MemoryCategory,
                  }))
                }
                value={draft.category}
              >
                {MEMORY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3 block space-y-2">
            <span className="text-sm font-medium text-foreground">Memory</span>
            <textarea
              aria-label={`New memory value for ${settings.agentLabel}`}
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              maxLength={2048}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  value: event.target.value,
                }))
              }
              placeholder="Ships larger changes after lunch when review coverage is online."
              value={draft.value}
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input
                checked={draft.isPublic}
                className="h-4 w-4 rounded border-border"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    isPublic: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Public memory
            </label>
            <Button
              disabled={!canRemember || busyAction === 'remember'}
              onClick={handleRemember}
              size="sm"
              type="button"
            >
              {busyAction === 'remember' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Remember
            </Button>
          </div>

          {status.message ? (
            <p
              className={
                status.tone === 'error'
                  ? 'mt-3 text-sm text-destructive'
                  : 'mt-3 text-sm text-muted-foreground'
              }
              data-testid="memory-controls-status"
            >
              {status.message}
            </p>
          ) : null}
        </div>

        {facts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            No pinned facts yet. Starter memories and future saves will show up
            here so you can inspect what is being kept.
          </div>
        ) : (
          <>
            <div
              className="rounded-xl border border-primary/20 bg-primary/5 p-4"
              data-testid="pinned-facts-receipts"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">
                    Latest memory receipts
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The newest saved facts stay visible here so you can confirm
                    what changed before digging into the full ledger.
                  </p>
                </div>
                <div className="rounded-full border border-primary/20 bg-background/90 px-3 py-1 text-xs font-medium text-primary">
                  Showing {recentFacts.length} of {facts.length}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {recentFacts.map((fact) => (
                  <div
                    className="rounded-lg border border-border/60 bg-background/85 p-3"
                    data-testid={`memory-receipt-${fact.id}`}
                    key={fact.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                        {formatFactLabel(fact.key)}
                      </span>
                      <span
                        className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        data-testid={`memory-receipt-category-${fact.id}`}
                      >
                        {formatCategoryLabel(fact.category)}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground"
                        data-testid={`memory-receipt-timestamp-${fact.id}`}
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        Saved {formatTimestamp(fact.updatedAt)}
                      </span>
                    </div>
                    <p
                      className="mt-3 whitespace-pre-wrap text-sm text-foreground"
                      data-testid={`memory-receipt-value-${fact.id}`}
                    >
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-medium text-foreground">
                  Full memory ledger
                </div>
                <p className="text-sm text-muted-foreground">
                  Every saved fact keeps its original seed note so you can audit
                  why it exists, not just when it was last updated.
                </p>
              </div>

              {facts.map((fact) => {
                const isEditing = editingId === fact.id && editDraft != null;
                const activeDraft = isEditing ? editDraft : null;

                return (
                  <div
                    className="rounded-xl border border-border/60 bg-background/80 p-4"
                    data-testid={`pinned-fact-${fact.id}`}
                    key={fact.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          {formatFactLabel(fact.key)}
                        </div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          {formatCategoryLabel(fact.category)}
                          {fact.isPublic ? ' · Public' : ' · Private'}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                        data-testid={`pinned-fact-updated-${fact.id}`}
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        Last updated {formatTimestamp(fact.updatedAt)}
                      </div>
                    </div>

                    {isEditing && activeDraft ? (
                      <div
                        className="mt-4 grid gap-3"
                        data-testid={`memory-edit-form-${fact.id}`}
                      >
                        <div className="grid gap-3 md:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">
                              Memory key
                            </span>
                            <Input
                              aria-label={`Edit memory key ${fact.key}`}
                              maxLength={128}
                              onChange={(event) =>
                                setEditDraft((current) =>
                                  current
                                    ? { ...current, key: event.target.value }
                                    : current
                                )
                              }
                              value={activeDraft.key}
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">
                              Category
                            </span>
                            <select
                              aria-label={`Edit memory category ${fact.key}`}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              onChange={(event) =>
                                setEditDraft((current) =>
                                  current
                                    ? {
                                        ...current,
                                        category: event.target
                                          .value as MemoryCategory,
                                      }
                                    : current
                                )
                              }
                              value={activeDraft.category}
                            >
                              {MEMORY_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {formatCategoryLabel(category)}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">
                            Memory
                          </span>
                          <textarea
                            aria-label={`Edit memory value ${fact.key}`}
                            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            maxLength={2048}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current
                                  ? { ...current, value: event.target.value }
                                  : current
                              )
                            }
                            value={activeDraft.value}
                          />
                        </label>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                              checked={activeDraft.isPublic}
                              className="h-4 w-4 rounded border-border"
                              onChange={(event) =>
                                setEditDraft((current) =>
                                  current
                                    ? {
                                        ...current,
                                        isPublic: event.target.checked,
                                      }
                                    : current
                                )
                              }
                              type="checkbox"
                            />
                            Public memory
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={cancelEdit}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                            <Button
                              disabled={
                                busyAction === `edit-${fact.id}` ||
                                activeDraft.key.trim().length === 0 ||
                                activeDraft.value.trim().length === 0
                              }
                              onClick={handleSaveEdit}
                              size="sm"
                              type="button"
                            >
                              {busyAction === `edit-${fact.id}` ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="mr-2 h-4 w-4" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                          {fact.value}
                        </p>

                        <div
                          className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3"
                          data-testid={`pinned-fact-origin-${fact.id}`}
                        >
                          <div className="text-xs font-medium uppercase tracking-wide text-primary">
                            {fact.originLabel}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {fact.originSnippet}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                          <Button
                            onClick={() => beginEdit(fact)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            disabled={busyAction === `forget-${fact.id}`}
                            onClick={() => handleForget(fact)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {busyAction === `forget-${fact.id}` ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Forget
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
