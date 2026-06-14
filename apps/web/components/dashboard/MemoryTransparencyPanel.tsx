'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Brain,
  Check,
  Loader2,
  Pencil,
  RefreshCcw,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface MemoryFact {
  id: string;
  key: string;
  value: string;
  category: string;
  isPublic: boolean;
  updatedAt: string;
  createdAt?: string;
}

export interface MemoryTransparencyPanelProps {
  agentId: string;
  agentLabel: string;
}

type EditState = {
  id: string;
  value: string;
  saving: boolean;
};

type DeleteState = {
  id: string;
  confirming: boolean;
  deleting: boolean;
};

type ToastMessage = {
  id: number;
  text: string;
  variant: 'success' | 'error';
};

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatFactLabel(key: string) {
  const normalized = key.startsWith('pinned_') ? key.slice(7) : key;
  return normalized
    .split('_')
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ');
}

function categoryVariant(category: string): 'default' | 'secondary' | 'outline' {
  if (category === 'profile_fact') return 'default';
  if (category === 'relationship_context') return 'secondary';
  return 'outline';
}

function categoryLabel(category: string) {
  return category
    .split('_')
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ');
}

export function MemoryTransparencyPanel({ agentId, agentLabel }: MemoryTransparencyPanelProps) {
  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [del, setDel] = useState<DeleteState | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);
  const toastCounter = useRef(0);

  function pushToast(text: string, variant: 'success' | 'error') {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, text, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function handleRefresh() {
    setRefreshTick((n) => n + 1);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(
          `/api/v1/developers/me/agent-memories?agentId=${encodeURIComponent(agentId)}`
        );
        const json = (await res.json()) as { success?: boolean; data?: unknown[]; error?: { message?: string } };
        if (cancelled) return;
        if (!res.ok) {
          setFetchError(json.error?.message ?? 'Failed to load memories.');
          return;
        }
        const rows = (json.data ?? []) as Array<{
          id: string;
          key: string;
          value: string;
          category: string;
          is_public: boolean;
          created_at?: string;
          updated_at?: string;
        }>;
        if (!cancelled) {
          setFacts(
            rows.map((r) => ({
              id: r.id,
              key: r.key,
              value: r.value,
              category: r.category,
              isPublic: r.is_public,
              updatedAt: r.updated_at ?? r.created_at ?? new Date().toISOString(),
              createdAt: r.created_at,
            }))
          );
        }
      } catch {
        if (!cancelled) setFetchError('Network error. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId, refreshTick]);

  function startEdit(fact: MemoryFact) {
    setDel(null);
    setEdit({ id: fact.id, value: fact.value, saving: false });
  }

  function cancelEdit() {
    setEdit(null);
  }

  async function saveEdit() {
    if (!edit) return;
    setEdit((prev) => prev && { ...prev, saving: true });
    const fact = facts.find((f) => f.id === edit.id);
    if (!fact) return;

    const optimisticFacts = facts.map((f) =>
      f.id === edit.id ? { ...f, value: edit.value, updatedAt: new Date().toISOString() } : f
    );
    setFacts(optimisticFacts);
    setEdit(null);

    try {
      const res = await fetch(`/api/v1/developers/me/agent-memories/${edit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, value: edit.value }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        pushToast(json.error?.message ?? 'Failed to save.', 'error');
        setFacts((prev) => prev.map((f) => (f.id === fact.id ? fact : f)));
        return;
      }
      pushToast('Memory updated.', 'success');
    } catch {
      pushToast('Network error. Reverted.', 'error');
      setFacts((prev) => prev.map((f) => (f.id === fact.id ? fact : f)));
    }
  }

  function startDelete(id: string) {
    setEdit(null);
    setDel({ id, confirming: true, deleting: false });
  }

  function cancelDelete() {
    setDel(null);
  }

  async function confirmDelete() {
    if (!del) return;
    setDel((prev) => prev && { ...prev, confirming: false, deleting: true });
    const optimisticFacts = facts.filter((f) => f.id !== del.id);
    const removed = facts.find((f) => f.id === del.id);
    setFacts(optimisticFacts);
    setDel(null);

    try {
      const res = await fetch(
        `/api/v1/developers/me/agent-memories/${del.id}?agentId=${encodeURIComponent(agentId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok && res.status !== 204) {
        pushToast('Failed to delete. Reverted.', 'error');
        if (removed) setFacts((prev) => [...prev, removed].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
        return;
      }
      pushToast('Memory deleted.', 'success');
    } catch {
      pushToast('Network error. Reverted.', 'error');
      if (removed) setFacts((prev) => [...prev, removed].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    }
  }

  return (
    <div className="relative" data-testid="memory-transparency-panel">
      {/* Toast stack */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        data-testid="toast-container"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            data-testid={`toast-${t.variant}`}
            className={`rounded-md px-4 py-2.5 text-sm font-medium shadow-lg pointer-events-auto ${
              t.variant === 'success'
                ? 'bg-primary text-primary-foreground'
                : 'bg-destructive text-destructive-foreground'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              Memory transparency
            </CardTitle>
            <CardDescription>
              What <strong>{agentLabel}</strong> remembers — edit or remove any fact in real time.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh memories"
            data-testid="refresh-button"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading && facts.length === 0 && (
            <div
              className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
              data-testid="loading-indicator"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading memories…
            </div>
          )}

          {!loading && fetchError && (
            <div
              className="flex items-center gap-2 px-6 py-4 text-sm text-destructive"
              role="alert"
              data-testid="fetch-error"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {fetchError}
            </div>
          )}

          {!loading && !fetchError && facts.length === 0 && (
            <p
              className="px-6 py-8 text-sm text-muted-foreground text-center"
              data-testid="empty-state"
            >
              No memories saved yet for {agentLabel}.
            </p>
          )}

          {facts.length > 0 && (
            <ul className="divide-y divide-border/40" data-testid="memory-list">
              {facts.map((fact) => {
                const isEditing = edit?.id === fact.id;
                const isDeleting = del?.id === fact.id;

                return (
                  <li
                    key={fact.id}
                    className="px-6 py-4 text-sm"
                    data-testid={`memory-item-${fact.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium leading-none" data-testid={`fact-key-${fact.id}`}>
                            {formatFactLabel(fact.key)}
                          </span>
                          <Badge
                            variant={categoryVariant(fact.category)}
                            className="text-xs"
                            data-testid={`fact-category-${fact.id}`}
                          >
                            {categoryLabel(fact.category)}
                          </Badge>
                          {fact.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2" data-testid={`edit-form-${fact.id}`}>
                            <Input
                              value={edit.value}
                              onChange={(e) =>
                                setEdit((prev) => prev && { ...prev, value: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') void saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="h-8 text-sm"
                              autoFocus
                              data-testid={`edit-input-${fact.id}`}
                              aria-label={`Edit value for ${formatFactLabel(fact.key)}`}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-primary"
                              onClick={() => void saveEdit()}
                              disabled={edit.saving || !edit.value.trim()}
                              aria-label="Save"
                              data-testid={`save-button-${fact.id}`}
                            >
                              {edit.saving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0"
                              onClick={cancelEdit}
                              aria-label="Cancel edit"
                              data-testid={`cancel-edit-button-${fact.id}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <p
                            className="text-muted-foreground leading-relaxed"
                            data-testid={`fact-value-${fact.id}`}
                          >
                            {fact.value}
                          </p>
                        )}

                        {isDeleting && del.confirming && (
                          <div
                            className="flex items-center gap-2 mt-2"
                            data-testid={`delete-confirm-${fact.id}`}
                          >
                            <span className="text-xs text-muted-foreground">Delete this memory?</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs"
                              onClick={() => void confirmDelete()}
                              data-testid={`confirm-delete-button-${fact.id}`}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={cancelDelete}
                              data-testid={`cancel-delete-button-${fact.id}`}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground/60">
                          Updated {formatTimestamp(fact.updatedAt)}
                        </p>
                      </div>

                      {!isEditing && !isDeleting && (
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => startEdit(fact)}
                            aria-label={`Edit ${formatFactLabel(fact.key)}`}
                            data-testid={`edit-button-${fact.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => startDelete(fact.id)}
                            aria-label={`Delete ${formatFactLabel(fact.key)}`}
                            data-testid={`delete-button-${fact.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
