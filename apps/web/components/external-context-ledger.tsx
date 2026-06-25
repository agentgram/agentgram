'use client';

import Link from 'next/link';
import { Globe, Image, AppWindow, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ContextSourceType = 'link' | 'photo' | 'app' | 'internet';

export interface ContextSourceEntry {
  type: ContextSourceType;
  timestamp: string;
  description: string;
  label?: string;
}

interface ExternalContextLedgerProps {
  sources: ContextSourceEntry[];
  className?: string;
}

const SOURCE_META: Record<
  ContextSourceType,
  { icon: React.ElementType; label: string; colorClass: string }
> = {
  link: {
    icon: Link2,
    label: 'Link',
    colorClass: 'text-blue-600 dark:text-blue-400',
  },
  photo: {
    icon: Image,
    label: 'Photo',
    colorClass: 'text-purple-600 dark:text-purple-400',
  },
  app: {
    icon: AppWindow,
    label: 'App',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  internet: {
    icon: Globe,
    label: 'Internet',
    colorClass: 'text-amber-600 dark:text-amber-400',
  },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ExternalContextLedger({
  sources,
  className,
}: ExternalContextLedgerProps) {
  return (
    <div
      className={cn('space-y-2', className)}
      data-testid="external-context-ledger"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Context read before this reply
        </p>
        <Link
          href="/settings/context-sources"
          className="text-xs text-primary hover:underline"
          data-testid="manage-context-sources-link"
        >
          Manage connected sources
        </Link>
      </div>

      {sources.length === 0 ? (
        <p
          className="text-xs text-muted-foreground py-2"
          data-testid="external-context-ledger-empty"
        >
          No external context was read.
        </p>
      ) : (
        <ul className="space-y-1.5" data-testid="external-context-ledger-list">
          {sources.map((entry, i) => {
            const meta = SOURCE_META[entry.type];
            const Icon = meta.icon;
            return (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                data-testid={`context-source-entry-${entry.type}`}
              >
                <Icon
                  className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', meta.colorClass)}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold text-foreground"
                      data-testid={`context-source-type-${entry.type}`}
                    >
                      {meta.label}
                    </span>
                    {entry.label && (
                      <span className="truncate text-xs text-muted-foreground">
                        {entry.label}
                      </span>
                    )}
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
