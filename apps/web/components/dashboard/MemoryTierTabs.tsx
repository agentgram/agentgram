'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Trash2 } from 'lucide-react';
import type { MemoryExportRecord } from './MemoryExportDashboard';

// Key Memories: long-term pinned facts that persist across sessions (Kindroid "Key Memories" tier)
// Session Context: ephemeral session facts (Kindroid "Cascaded" tier)
// Discriminator: profile_fact → Key Memories; everything else → Session Context
// Note: memoryTier field is pending API support — derived from category for now.
export const KEY_MEMORY_CATEGORIES = new Set(['profile_fact']);

export function getMemoryTier(memory: MemoryExportRecord): 'long_term' | 'session' {
  return KEY_MEMORY_CATEGORIES.has(memory.category) ? 'long_term' : 'session';
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

interface MemoryListProps {
  memories: MemoryExportRecord[];
  deleting: Set<string>;
  onDelete: (memory: MemoryExportRecord) => void;
  emptyLabel: string;
}

function MemoryGroupList({ memories, deleting, onDelete, emptyLabel }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </CardContent>
      </Card>
    );
  }

  const grouped = memories.reduce<Record<string, MemoryExportRecord[]>>((acc, m) => {
    const key = `${m.agentId}|${m.agentLabel}`;
    (acc[key] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
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
                      onClick={() => onDelete(memory)}
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
  );
}

interface MemoryTierTabsProps {
  memories: MemoryExportRecord[];
  deleting: Set<string>;
  onDelete: (memory: MemoryExportRecord) => void;
}

export function MemoryTierTabs({ memories, deleting, onDelete }: MemoryTierTabsProps) {
  const keyMemories = memories.filter((m) => getMemoryTier(m) === 'long_term');
  const sessionMemories = memories.filter((m) => getMemoryTier(m) === 'session');

  return (
    <Tabs defaultValue="key-memories" data-testid="memory-tier-tabs">
      <TabsList data-testid="memory-tier-tabs-list">
        <TabsTrigger value="key-memories" data-testid="tab-key-memories">
          Key Memories
          {keyMemories.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1">
              {keyMemories.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="session-context" data-testid="tab-session-context">
          Session Context
          {sessionMemories.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1">
              {sessionMemories.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="key-memories" data-testid="tabpanel-key-memories">
        <p className="text-xs text-muted-foreground mb-3">
          Long-term facts that persist across all sessions.
        </p>
        <MemoryGroupList
          memories={keyMemories}
          deleting={deleting}
          onDelete={onDelete}
          emptyLabel="No key memories yet. Profile facts will appear here."
        />
      </TabsContent>

      <TabsContent value="session-context" data-testid="tabpanel-session-context">
        <p className="text-xs text-muted-foreground mb-3">
          Facts captured during this session. May not persist long-term.
        </p>
        <MemoryGroupList
          memories={sessionMemories}
          deleting={deleting}
          onDelete={onDelete}
          emptyLabel="No session context memories yet."
        />
      </TabsContent>
    </Tabs>
  );
}
