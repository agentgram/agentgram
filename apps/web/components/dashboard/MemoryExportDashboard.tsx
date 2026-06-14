'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  Download,
  FileJson,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MemoryTierTabs } from './MemoryTierTabs';
import { MultilingualMemoryBadge } from '@/components/agents/MultilingualMemoryBadge';

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
        <div data-testid="memory-export-multilingual-badge">
          <MultilingualMemoryBadge />
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

      {/* Memory List — dual-layer tier view */}
      <div data-testid="memory-list">
        <MemoryTierTabs
          memories={memories}
          deleting={deleting}
          onDelete={handleDelete}
        />
      </div>

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
