'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Users, MapPin, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLorebookMatchPreview } from '@/lib/lorebook/useLorebookMatchPreview';
import type { MatchedLorebookEntry } from '@/app/api/v1/agents/[agentId]/lorebook/preview/route';

interface LorebookMatchPreviewProps {
  agentId: string;
  starterMessage?: string;
  className?: string;
}

const CATEGORY_ICONS = {
  person: Users,
  place: MapPin,
  rule: ScrollText,
} as const;

const CATEGORY_LABELS = {
  person: 'Character',
  place: 'Place',
  rule: 'Rule',
} as const;

function EntryRow({ entry }: { entry: MatchedLorebookEntry }) {
  const Icon = CATEGORY_ICONS[entry.category];
  return (
    <li
      className="flex items-start gap-2.5 py-2"
      data-testid={`lorebook-entry-${entry.id}`}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {CATEGORY_LABELS[entry.category]}
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {entry.label}
          </span>
        </div>
        {entry.snippet && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {entry.snippet}
          </p>
        )}
      </div>
    </li>
  );
}

export function LorebookMatchPreview({
  agentId,
  starterMessage = '',
  className,
}: LorebookMatchPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const { entries, totalEntries, isLoading } = useLorebookMatchPreview(
    agentId,
    starterMessage
  );

  if (isLoading || totalEntries === 0) {
    return null;
  }

  const matchCount = entries.length;

  if (matchCount === 0) {
    return null;
  }

  const summary = buildSummary(entries);

  return (
    <div
      data-testid="lorebook-match-preview"
      className={cn(
        'rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm',
        className
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded((v) => !v)}
        data-testid="lorebook-match-toggle"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 font-medium text-foreground">
          <BookOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>
            {summary}
          </span>
          <span
            data-testid="lorebook-match-count"
            className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-normal text-primary"
          >
            {matchCount} active
          </span>
        </span>
        <span className="ml-2 text-muted-foreground" aria-hidden>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <ul
          className="mt-3 divide-y divide-border/50"
          data-testid="lorebook-match-list"
          aria-label="Active lore entries"
        >
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

function buildSummary(entries: MatchedLorebookEntry[]): string {
  const ruleCount = entries.filter((e) => e.category === 'rule').length;
  const personCount = entries.filter((e) => e.category === 'person').length;
  const placeCount = entries.filter((e) => e.category === 'place').length;

  const parts: string[] = [];
  if (ruleCount > 0) parts.push(`${ruleCount} ${ruleCount === 1 ? 'rule' : 'rules'}`);
  if (personCount > 0) parts.push(`${personCount} ${personCount === 1 ? 'character' : 'characters'}`);
  if (placeCount > 0) parts.push(`${placeCount} ${placeCount === 1 ? 'place' : 'places'}`);

  return `Lore active: ${parts.join(', ')}`;
}
