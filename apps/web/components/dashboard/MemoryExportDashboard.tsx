'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  Download,
  FileJson,
  FileText,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface MemoryExportRecord {
  id: string;
  agentId: string;
  agentLabel: string;
  key: string;
  value: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  memories: MemoryExportRecord[];
}

const CATEGORY_LABELS: Record<string, string> = {
  profile_fact: 'Profile fact',
  relationship_context: 'Relationship context',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportJson(memories: MemoryExportRecord[]) {
  const payload = {
    export_metadata: {
      generated_at: new Date().toISOString(),
      gdpr_basis: 'GDPR Article 20 — Right to data portability',
      record_count: memories.length,
    },
    memories: memories.map((m) => ({
      id: m.id,
      agent_id: m.agentId,
      agent_label: m.agentLabel,
      key: m.key,
      value: m.value,
      category: m.category,
      is_public: m.isPublic,
      captured_at: m.createdAt,
      updated_at: m.updatedAt,
    })),
  };
  downloadBlob(
    JSON.stringify(payload, null, 2),
    'agentgram-memories.json',
    'application/json'
  );
}

function exportCsv(memories: MemoryExportRecord[]) {
  const header = ['id', 'agent_id', 'agent_label', 'key', 'value', 'category', 'is_public', 'captured_at', 'updated_at'];
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = memories.map((m) =>
    [
      m.id,
      m.agentId,
      m.agentLabel,
      m.key,
      m.value,
      m.category,
      String(m.isPublic),
      m.createdAt,
      m.updatedAt,
    ]
      .map(escape)
      .join(',')
  );
  downloadBlob(
    [header.join(','), ...rows].join('\n'),
    'agentgram-memories.csv',
    'text/csv'
  );
}

export function MemoryExportDashboard({ memories: initialMemories }: Props) {
  const [memories, setMemories] = useState<MemoryExportRecord[]>(initialMemories);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(memory: MemoryExportRecord) {
    setDeleting((prev) => new Set(prev).add(memory.id));
    setDeleteError(null);
    try {
      const res = await fetch(
        `/api/v1/developers/me/agent-memories/${memory.id}?agentId=${encodeURIComponent(memory.agentId)}`,
        { method: 'DELETE' }
      );
      if (res.ok || res.status === 204) {
        setMemories((prev) => prev.filter((m) => m.id !== memory.id));
      } else {
        const body = (await res.json()) as { error?: { message?: string } };
        setDeleteError(body.error?.message ?? 'Failed to delete memory.');
      }
    } catch {
      setDeleteError('Network error. Please try again.');
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(memory.id);
        return next;
      });
    }
  }

  const grouped = memories.reduce<Record<string, MemoryExportRecord[]>>((acc, m) => {
    const key = `${m.agentId}|${m.agentLabel}`;
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-3xl" data-testid="memory-export-dashboard">
      <div className="space-y-2">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memory Export</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              All AI-remembered facts about you — view, delete, or export.
            </p>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm" data-testid="memory-export-actions-card">
        <CardHeader>
          <CardTitle className="text-base">Export all memories</CardTitle>
          <CardDescription>
            Download a copy of all {memories.length} remembered facts in your
            preferred format.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => exportJson(memories)}
            disabled={memories.length === 0}
            className="gap-2"
            data-testid="export-json-btn"
          >
            <FileJson className="h-4 w-4" />
            Export as JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => exportCsv(memories)}
            disabled={memories.length === 0}
            className="gap-2"
            data-testid="export-csv-btn"
          >
            <FileText className="h-4 w-4" />
            Export as CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportJson(memories)}
            disabled={memories.length === 0}
            className="gap-2"
            data-testid="export-all-btn"
          >
            <Download className="h-4 w-4" />
            Export all memories
          </Button>
        </CardContent>
      </Card>

      {deleteError && (
        <p className="text-sm text-destructive" role="alert">
          {deleteError}
        </p>
      )}

      {/* Memory List */}
      {memories.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No remembered facts yet. Facts are captured as your agents learn
            about you over time.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6" data-testid="memory-list">
          {Object.entries(grouped).map(([groupKey, groupMemories]) => {
            const agentLabel = groupKey.split('|')[1];
            return (
              <Card
                key={groupKey}
                className="border-border/50 bg-card/50 backdrop-blur-sm"
                data-testid={`memory-group-${groupKey}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{agentLabel}</CardTitle>
                  <CardDescription>
                    {groupMemories.length} remembered{' '}
                    {groupMemories.length === 1 ? 'fact' : 'facts'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                  {groupMemories.map((memory, idx) => (
                    <div key={memory.id}>
                      {idx > 0 && <Separator />}
                      <div
                        className="flex items-start justify-between gap-4 px-6 py-4"
                        data-testid={`memory-item-${memory.id}`}
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground truncate">
                              {memory.key}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 shrink-0"
                              data-testid={`memory-category-${memory.id}`}
                            >
                              {CATEGORY_LABELS[memory.category] ?? memory.category}
                            </Badge>
                            {memory.isPublic && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5 shrink-0"
                              >
                                Public
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground break-words">
                            {memory.value}
                          </p>
                          <p
                            className="text-xs text-muted-foreground"
                            data-testid={`memory-date-${memory.id}`}
                          >
                            Captured {formatDate(memory.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(memory)}
                          disabled={deleting.has(memory.id)}
                          aria-label={`Delete memory: ${memory.key}`}
                          data-testid={`delete-memory-${memory.id}`}
                        >
                          {deleting.has(memory.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* GDPR note */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Your data rights</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Under GDPR Article 17, you have the right to erasure of personal
            data. Delete individual facts above or export them all before
            deletion.
          </p>
          <p>
            To request deletion of your entire account and all associated data,
            contact{' '}
            <a
              href="mailto:privacy@agentgram.com"
              className="underline hover:text-foreground"
            >
              privacy@agentgram.com
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
