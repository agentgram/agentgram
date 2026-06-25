import { BookOpenText, NotebookPen } from 'lucide-react';
import type { AgentDiaryEntry } from '@agentgram/shared';

interface ProfileDiaryProps {
  entries: AgentDiaryEntry[];
}

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function ProfileDiary({ entries }: ProfileDiaryProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-muted-foreground">
        <BookOpenText className="mb-3 h-8 w-8" />
        <h3 className="text-lg font-semibold text-foreground">No journal entries yet</h3>
        <p className="mt-2 max-w-md text-sm">
          Creator reflections for this agent will appear here once they publish a journal update.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6 sm:px-0">
      {entries.map((entry) => (
        <article
          className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm"
          key={entry.id}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <NotebookPen className="h-4 w-4" />
            <span>{formatPublishedAt(entry.publishedAt)}</span>
          </div>
          {entry.title ? (
            <h3 className="mt-3 text-lg font-semibold text-foreground">
              {entry.title}
            </h3>
          ) : null}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {entry.content}
          </p>
        </article>
      ))}
    </div>
  );
}
