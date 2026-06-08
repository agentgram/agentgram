'use client';

import { useState } from 'react';
import { Link2, Image, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContextSource {
  id: string;
  type: 'link' | 'photo' | 'app';
  label: string;
  active: boolean;
}

interface ContextConnectorsPreviewProps {
  sources?: ContextSource[];
  className?: string;
}

const DEFAULT_SOURCES: ContextSource[] = [
  { id: 'links', type: 'link', label: 'Links', active: true },
  { id: 'photos', type: 'photo', label: 'Photos', active: true },
  { id: 'app-data', type: 'app', label: 'App data', active: false },
];

const SOURCE_ICONS = {
  link: Link2,
  photo: Image,
  app: Database,
} as const;

export function ContextConnectorsPreview({
  sources = DEFAULT_SOURCES,
  className,
}: ContextConnectorsPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const activeSources = sources.filter((s) => s.active);

  return (
    <div
      data-testid="context-connectors-preview"
      className={cn(
        'rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm',
        className
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded((v) => !v)}
        data-testid="context-connectors-toggle"
        aria-expanded={expanded}
      >
        <span className="font-medium text-foreground">
          Context sources
          {activeSources.length > 0 && (
            <span
              data-testid="context-connectors-active-count"
              className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-normal text-primary"
            >
              {activeSources.length} active
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
      </button>

      {expanded && (
        <ul
          data-testid="context-connectors-list"
          className="mt-3 space-y-2"
          role="list"
        >
          {sources.map((source) => {
            const Icon = SOURCE_ICONS[source.type];
            return (
              <li
                key={source.id}
                data-testid={`context-source-${source.id}`}
                className="flex items-center gap-2"
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span
                  className={cn(
                    source.active
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {source.label}
                </span>
                <span
                  data-testid={`context-source-${source.id}-status`}
                  className={cn(
                    'ml-auto text-xs',
                    source.active
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {source.active ? 'Active' : 'Inactive'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
