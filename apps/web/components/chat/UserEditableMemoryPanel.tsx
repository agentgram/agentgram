'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface MemoryFact {
  id: string;
  key: string;
  value: string;
  category: 'profile_fact' | 'relationship_context' | string;
  isPublic: boolean;
  updatedAt: string;
}

interface MemoryApiRow {
  id: string;
  key: string;
  value: string;
  category: string;
  is_public: boolean;
  updated_at: string;
  created_at: string;
}

export interface UserEditableMemoryPanelProps {
  agentId: string;
  agentLabel: string;
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CategoryBadge({ category }: { category: string }) {
  const isProfile = category === 'profile_fact';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
        isProfile
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
          : 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400'
      )}
      data-testid={`memory-fact-category-${category}`}
    >
      {isProfile ? 'Profile' : 'Session'}
    </span>
  );
}

interface FactRowProps {
  fact: MemoryFact;
  agentId: string;
  onUpdated: (updated: MemoryFact) => void;
  onDeleted: (id: string) => void;
}

function FactRow({ fact, agentId, onUpdated, onDeleted }: FactRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(fact.value);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleEdit = useCallback(() => {
    setEditValue(fact.value);
    setEditing(true);
  }, [fact.value]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setEditValue(fact.value);
  }, [fact.value]);

  const handleSave = useCallback(async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === fact.value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/v1/developers/me/agent-memories/${fact.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            key: fact.key,
            value: trimmed,
            category: fact.category,
          }),
        }
      );
      if (res.ok) {
        const json = (await res.json()) as { data?: MemoryApiRow };
        if (json.data) {
          onUpdated({
            ...fact,
            value: json.data.value,
            updatedAt: json.data.updated_at,
          });
        }
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }, [agentId, editValue, fact, onUpdated]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/v1/developers/me/agent-memories/${fact.id}?agentId=${encodeURIComponent(agentId)}`,
        { method: 'DELETE' }
      );
      if (res.ok || res.status === 204) {
        onDeleted(fact.id);
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [agentId, fact.id, onDeleted]);

  return (
    <div
      className="group rounded-lg border border-border/50 bg-background p-3 transition-colors hover:border-border"
      data-testid={`memory-panel-fact-${fact.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="text-xs font-semibold text-foreground"
              data-testid={`memory-panel-key-${fact.id}`}
            >
              {humanizeKey(fact.key)}
            </span>
            <CategoryBadge category={fact.category} />
          </div>

          {editing ? (
            <div className="mt-2 flex items-center gap-1.5">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-7 text-xs"
                aria-label={`Edit value for ${fact.key}`}
                data-testid={`memory-panel-edit-input-${fact.id}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                disabled={saving}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={handleSave}
                disabled={saving}
                data-testid={`memory-panel-save-${fact.id}`}
                aria-label={`Save ${fact.key}`}
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 text-emerald-600" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={handleCancelEdit}
                disabled={saving}
                data-testid={`memory-panel-cancel-edit-${fact.id}`}
                aria-label={`Cancel editing ${fact.key}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <p
              className="mt-1 text-xs text-muted-foreground line-clamp-2"
              data-testid={`memory-panel-value-${fact.id}`}
            >
              {fact.value}
            </p>
          )}
        </div>

        {!editing && !confirmDelete && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleEdit}
              data-testid={`memory-panel-edit-btn-${fact.id}`}
              aria-label={`Edit ${fact.key}`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              data-testid={`memory-panel-delete-btn-${fact.id}`}
              aria-label={`Delete ${fact.key}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div
          className="mt-2 flex items-center gap-2 rounded-md bg-destructive/10 px-2 py-1.5 text-xs"
          data-testid={`memory-panel-delete-confirm-${fact.id}`}
        >
          <span className="flex-1 text-destructive">Remove this memory?</span>
          <Button
            size="sm"
            variant="destructive"
            className="h-6 px-2 text-xs"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            data-testid={`memory-panel-delete-confirm-yes-${fact.id}`}
            aria-label={`Confirm delete ${fact.key}`}
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Remove'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => setConfirmDelete(false)}
            data-testid={`memory-panel-delete-confirm-cancel-${fact.id}`}
            aria-label="Cancel delete"
          >
            Keep
          </Button>
        </div>
      )}
    </div>
  );
}

export function UserEditableMemoryPanel({
  agentId,
  agentLabel,
}: UserEditableMemoryPanelProps) {
  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFacts = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true);
      try {
        const res = await fetch(
          `/api/v1/developers/me/agent-memories?agentId=${encodeURIComponent(agentId)}`
        );
        if (res.status === 401 || res.status === 403) {
          setVisible(false);
          return;
        }
        if (!res.ok) {
          setError('Could not load memories.');
          setVisible(true);
          return;
        }
        const json = (await res.json()) as { data?: MemoryApiRow[] };
        if (!json.data) {
          setVisible(false);
          return;
        }
        setFacts(
          json.data.map((row) => ({
            id: row.id,
            key: row.key,
            value: row.value,
            category: row.category,
            isPublic: row.is_public,
            updatedAt: row.updated_at,
          }))
        );
        setLastRefreshed(new Date());
        setVisible(true);
        setError(null);
      } catch {
        setError('Could not load memories.');
        setVisible(true);
      } finally {
        setLoading(false);
        if (showRefreshing) setRefreshing(false);
      }
    },
    [agentId]
  );

  useEffect(() => {
    fetchFacts();
  }, [fetchFacts]);

  const handleUpdated = useCallback((updated: MemoryFact) => {
    setFacts((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
    setLastRefreshed(new Date());
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setFacts((prev) => prev.filter((f) => f.id !== id));
    setLastRefreshed(new Date());
  }, []);

  if (!visible) return null;

  return (
    <div
      className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm"
      data-testid="user-editable-memory-panel"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-semibold"
          onClick={() => setCollapsed((c) => !c)}
          data-testid="memory-panel-toggle"
          aria-expanded={!collapsed}
        >
          <Brain className="h-4 w-4 text-violet-500" aria-hidden />
          <span>Memory — {agentLabel}</span>
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {lastRefreshed && !collapsed && (
            <span
              className="flex items-center gap-1 text-[10px] text-muted-foreground"
              data-testid="memory-panel-live-indicator"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Live · {timeAgo(lastRefreshed.toISOString())}
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => fetchFacts(true)}
            disabled={refreshing}
            data-testid="memory-panel-refresh"
            aria-label="Refresh memories"
          >
            <RefreshCw
              className={cn('h-3 w-3', refreshing && 'animate-spin')}
            />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3">
          {loading ? (
            <div
              className="flex items-center justify-center py-6"
              data-testid="memory-panel-loading"
            >
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p
              className="py-4 text-center text-xs text-muted-foreground"
              data-testid="memory-panel-error"
            >
              {error}
            </p>
          ) : facts.length === 0 ? (
            <div
              className="py-6 text-center"
              data-testid="memory-panel-empty-state"
            >
              <p className="text-xs text-muted-foreground">
                No memories saved yet. Facts remembered during this session will
                appear here.
              </p>
            </div>
          ) : (
            <div
              className="space-y-2"
              data-testid="memory-panel-facts-list"
            >
              {facts.map((fact) => (
                <FactRow
                  key={fact.id}
                  fact={fact}
                  agentId={agentId}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              ))}
            </div>
          )}

          <p className="mt-3 text-[10px] text-muted-foreground/70">
            Changes take effect in the next reply.{' '}
            <a
              href="/dashboard/memory-export"
              className="underline underline-offset-2 hover:text-muted-foreground"
              data-testid="memory-panel-full-dashboard-link"
            >
              Full memory dashboard →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default UserEditableMemoryPanel;
