'use client';

import { useEffect, useState } from 'react';
import { Brain, ChevronRight, FileText, RefreshCw, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type AgentMemory = {
  id: string;
  agent_id: string;
  key: string;
  value: string;
  category: 'profile_fact' | 'relationship_context';
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

type CategoryFilter = 'all' | 'profile_fact' | 'relationship_context';

const CATEGORY_META = {
  profile_fact: {
    label: 'Profile Facts',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Stable identity attributes the agent remembers about itself.',
  },
  relationship_context: {
    label: 'Relationship Context',
    icon: Users,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'Contextual facts the agent remembers about people it interacts with.',
  },
} as const;

function MemoryNode({ memory }: { memory: AgentMemory }) {
  const meta = CATEGORY_META[memory.category];
  return (
    <div
      data-testid="memory-node"
      className={`rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-accent/50 ${meta.bgColor} ${meta.borderColor}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`font-medium truncate ${meta.color}`}>{memory.key}</p>
          <p className="mt-0.5 text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {memory.value}
          </p>
        </div>
        {memory.is_public && (
          <Badge variant="outline" className="shrink-0 text-[10px] h-5 px-1.5">
            public
          </Badge>
        )}
      </div>
    </div>
  );
}

function CategoryBranch({
  category,
  memories,
}: {
  category: 'profile_fact' | 'relationship_context';
  memories: AgentMemory[];
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <div data-testid={`category-branch-${category}`} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`rounded-md p-1.5 ${meta.bgColor}`}>
          <Icon className={`h-4 w-4 ${meta.color}`} />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-none">{meta.label}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {memories.length}
        </Badge>
      </div>

      {memories.length === 0 ? (
        <p
          data-testid={`empty-category-${category}`}
          className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground"
        >
          No {meta.label.toLowerCase()} stored yet.
        </p>
      ) : (
        <div className="relative space-y-2 pl-4">
          {/* Connector line */}
          <div
            aria-hidden="true"
            className="absolute left-1.5 top-0 bottom-2 w-px bg-border"
          />
          {memories.map((memory) => (
            <div key={memory.id} className="relative flex items-start gap-2">
              <div
                aria-hidden="true"
                className="absolute -left-2.5 top-4 h-px w-4 bg-border"
              />
              <ChevronRight className="mt-[11px] h-3 w-3 shrink-0 text-muted-foreground/50" />
              <div className="flex-1 min-w-0">
                <MemoryNode memory={memory} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface MemoryMindMapPanelProps {
  agentId: string;
  agentLabel: string;
}

export function MemoryMindMapPanel({
  agentId,
  agentLabel,
}: MemoryMindMapPanelProps) {
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [fetchVersion, setFetchVersion] = useState(0);

  useEffect(() => {
    async function load() {
      setStatus('loading');
      try {
        const res = await fetch(
          `/api/v1/developers/me/agent-memories?agentId=${encodeURIComponent(agentId)}`
        );
        const json = (await res.json()) as {
          success: boolean;
          data?: AgentMemory[];
        };
        if (!res.ok || !json.success) {
          setStatus('error');
          return;
        }
        setMemories(json.data ?? []);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    }
    void load();
  }, [agentId, fetchVersion]);

  const visibleMemories =
    categoryFilter === 'all'
      ? memories
      : memories.filter((m) => m.category === categoryFilter);

  const profileFacts = visibleMemories.filter((m) => m.category === 'profile_fact');
  const relationshipContext = visibleMemories.filter(
    (m) => m.category === 'relationship_context'
  );

  return (
    <Card data-testid="memory-mind-map-panel">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Memory Mind Map</CardTitle>
              <CardDescription className="mt-1">
                Linked memory nodes and fact relationships for{' '}
                <span className="font-medium text-foreground">{agentLabel}</span>.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh memory map"
            onClick={() => setFetchVersion((v) => v + 1)}
            disabled={status === 'loading'}
          >
            <RefreshCw
              className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary bar */}
        <div
          data-testid="memory-summary"
          className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm"
        >
          <span className="font-medium">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} total
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {memories.filter((m) => m.category === 'profile_fact').length} profile facts
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {memories.filter((m) => m.category === 'relationship_context').length}{' '}
            relationship context
          </span>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(['all', 'profile_fact', 'relationship_context'] as CategoryFilter[]).map(
            (cat) => (
              <button
                key={cat}
                data-testid={`filter-${cat}`}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {cat === 'all'
                  ? 'All'
                  : cat === 'profile_fact'
                    ? 'Profile Facts'
                    : 'Relationship Context'}
              </button>
            )
          )}
        </div>

        {/* Body */}
        {status === 'loading' && (
          <div
            data-testid="loading-state"
            className="flex items-center justify-center py-12 text-sm text-muted-foreground"
          >
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading memory map…
          </div>
        )}

        {status === 'error' && (
          <div
            data-testid="error-state"
            className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
          >
            Could not load the memory map. Try refreshing.
          </div>
        )}

        {status === 'success' && memories.length === 0 && (
          <div
            data-testid="empty-state"
            className="rounded-lg border border-dashed py-12 text-center"
          >
            <Brain className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No memories yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Memories will appear here once the agent starts learning.
            </p>
          </div>
        )}

        {status === 'success' && memories.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            {(categoryFilter === 'all' || categoryFilter === 'profile_fact') && (
              <CategoryBranch category="profile_fact" memories={profileFacts} />
            )}
            {(categoryFilter === 'all' || categoryFilter === 'relationship_context') && (
              <CategoryBranch
                category="relationship_context"
                memories={relationshipContext}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
