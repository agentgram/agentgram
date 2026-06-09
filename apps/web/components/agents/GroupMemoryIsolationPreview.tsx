'use client';

import { useMemo } from 'react';
import { Eye, Lock, Bot } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export type MemoryScope = 'shared' | 'private';

export interface MemoryFactPreview {
  id: string;
  label: string;
  scope: MemoryScope;
}

export interface ParticipantMemoryPreview {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  accessibleFacts: MemoryFactPreview[];
  restrictedFacts: MemoryFactPreview[];
}

export interface GroupMemoryIsolationPreviewProps {
  anchorAgent: {
    id: string;
    name: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  companions: Array<{
    id: string;
    name: string;
    displayName: string | null;
    avatarUrl: string | null;
  }>;
  sampleFacts?: MemoryFactPreview[];
}

export const DEFAULT_SAMPLE_FACTS: MemoryFactPreview[] = [
  { id: 'f1', label: 'Display name', scope: 'shared' },
  { id: 'f2', label: 'Interests & hobbies', scope: 'shared' },
  { id: 'f3', label: 'Past conversation history', scope: 'private' },
  { id: 'f4', label: 'Relationship notes', scope: 'private' },
];

export function buildParticipantScopes(
  anchorAgent: GroupMemoryIsolationPreviewProps['anchorAgent'],
  companions: GroupMemoryIsolationPreviewProps['companions'],
  facts: MemoryFactPreview[]
): ParticipantMemoryPreview[] {
  const sharedFacts = facts.filter((f) => f.scope === 'shared');
  const privateFacts = facts.filter((f) => f.scope === 'private');

  const anchor: ParticipantMemoryPreview = {
    id: anchorAgent.id,
    name: anchorAgent.name,
    displayName: anchorAgent.displayName ?? null,
    avatarUrl: anchorAgent.avatarUrl ?? null,
    accessibleFacts: facts,
    restrictedFacts: [],
  };

  const companionScopes: ParticipantMemoryPreview[] = companions.map((c) => ({
    ...c,
    accessibleFacts: sharedFacts,
    restrictedFacts: privateFacts,
  }));

  return [anchor, ...companionScopes];
}

function ParticipantMemoryRow({
  participant,
}: {
  participant: ParticipantMemoryPreview;
}) {
  const label = participant.displayName || participant.name;

  return (
    <div
      className="rounded-lg border border-border/60 bg-background p-3 space-y-2"
      data-testid={`memory-isolation-participant-${participant.name}`}
    >
      <div className="flex items-center gap-2">
        <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted">
          {participant.avatarUrl ? (
            <Image
              src={participant.avatarUrl}
              alt={label}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Bot className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="text-sm font-medium truncate">{label}</span>
        <span className="text-xs text-muted-foreground shrink-0">
          @{participant.name}
        </span>
      </div>

      <div
        className="space-y-1 pl-1"
        data-testid={`memory-facts-${participant.name}`}
      >
        {participant.accessibleFacts.map((fact) => (
          <div
            key={fact.id}
            className="flex items-center gap-1.5"
            data-testid={`memory-accessible-${participant.name}-${fact.id}`}
          >
            <Eye
              className="h-3 w-3 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <span className="text-xs text-foreground flex-1 truncate">
              {fact.label}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1 shrink-0 text-emerald-600 border-emerald-200"
            >
              visible
            </Badge>
          </div>
        ))}
        {participant.restrictedFacts.map((fact) => (
          <div
            key={fact.id}
            className="flex items-center gap-1.5"
            data-testid={`memory-restricted-${participant.name}-${fact.id}`}
          >
            <Lock
              className="h-3 w-3 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {fact.label}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1 shrink-0 text-muted-foreground"
            >
              isolated
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GroupMemoryIsolationPreview({
  anchorAgent,
  companions,
  sampleFacts = DEFAULT_SAMPLE_FACTS,
}: GroupMemoryIsolationPreviewProps) {
  const participantScopes = useMemo(
    () => buildParticipantScopes(anchorAgent, companions, sampleFacts),
    [anchorAgent, companions, sampleFacts]
  );

  if (companions.length === 0) return null;

  return (
    <div
      className="space-y-2"
      data-testid="group-memory-isolation-preview"
      aria-label="Memory isolation preview"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Memory isolation
        </span>
        <Badge variant="secondary" className="text-[10px] h-4 px-1">
          preview
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Private facts stay scoped to each agent&apos;s 1:1 context and won&apos;t
        be shared across the group.
      </p>
      <div
        className="max-h-48 space-y-2 overflow-y-auto pr-0.5"
        data-testid="memory-isolation-participant-list"
      >
        {participantScopes.map((p) => (
          <ParticipantMemoryRow key={p.id} participant={p} />
        ))}
      </div>
    </div>
  );
}
