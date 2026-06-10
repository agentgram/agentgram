'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MemoryAuditEvent, MemoryAuditPage } from '@agentgram/shared';

export type { MemoryAuditEvent, MemoryAuditPage };

interface Props {
  initialData: MemoryAuditPage;
  agentId: string;
  agentLabel: string;
}

const OP_ICON = {
  read: <Eye className="h-3.5 w-3.5" />,
  write: <Pencil className="h-3.5 w-3.5" />,
  delete: <Trash2 className="h-3.5 w-3.5" />,
} as const;

const OP_VARIANT: Record<
  MemoryAuditEvent['operation'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  read: 'secondary',
  write: 'default',
  delete: 'destructive',
};

function formatTs(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function MemoryAuditDashboard({ initialData, agentId, agentLabel }: Props) {
  const [data, setData] = useState<MemoryAuditPage>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPage(page: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/agents/me/memory-audit?agentId=${encodeURIComponent(agentId)}&page=${page}&pageSize=${data.pageSize}`
      );
      if (!res.ok) {
        const body = (await res.json()) as { error?: { message?: string } };
        setError(body.error?.message ?? 'Failed to load audit log.');
        return;
      }
      const json = (await res.json()) as { data: MemoryAuditPage };
      setData(json.data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl" data-testid="memory-audit-dashboard">
      <div className="space-y-2">
        <Link
          href="/dashboard/memory-export"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Memory
        </Link>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memory Access Audit</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Every read, write, and delete on <strong>{agentLabel}</strong>&apos;s memory — visible only to you.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm" data-testid="audit-summary-card">
        <CardHeader>
          <CardTitle className="text-base">Audit summary</CardTitle>
          <CardDescription>
            {data.total} event{data.total !== 1 ? 's' : ''} recorded
            {' · '}page {data.page} of {Math.ceil(data.total / data.pageSize) || 1}
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card className="border-border/50" data-testid="audit-log-card">
        <CardContent className="p-0">
          {data.events.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground" data-testid="audit-empty">
              No memory access events recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/40" data-testid="audit-event-list">
              {data.events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start gap-4 px-6 py-4 text-sm"
                  data-testid={`audit-event-${event.id}`}
                >
                  <Badge
                    variant={OP_VARIANT[event.operation]}
                    className="flex items-center gap-1 shrink-0 mt-0.5"
                  >
                    {OP_ICON[event.operation]}
                    {event.operation}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{event.factKey}</p>
                    <p className="text-muted-foreground truncate">{event.factSummary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-muted-foreground">{formatTs(event.timestamp)}</p>
                    <p className="text-xs text-muted-foreground/60 font-mono truncate max-w-[14ch]">
                      {event.sessionId}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {(data.page > 1 || data.hasMore) && (
        <div className="flex items-center justify-between" data-testid="audit-pagination">
          <button
            onClick={() => loadPage(data.page - 1)}
            disabled={data.page <= 1 || loading}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {data.page}
          </span>
          <button
            onClick={() => loadPage(data.page + 1)}
            disabled={!data.hasMore || loading}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
