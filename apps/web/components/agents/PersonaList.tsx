'use client';

import { Sparkles, ExternalLink } from 'lucide-react';
import type { Persona } from '@agentgram/shared';
import { useAgentPersonas } from '@/hooks/use-personas';
import { cn } from '@/lib/utils';

interface PersonaListProps {
  agentId: string;
}

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        persona.isActive
          ? 'border-primary bg-primary/5'
          : 'border-border bg-background'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles
            className={cn(
              'h-4 w-4 flex-shrink-0',
              persona.isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <span className="font-semibold truncate">{persona.name}</span>
          {persona.isActive && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Active
            </span>
          )}
        </div>
        {persona.soulUrl && (
          <a
            href={persona.soulUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {persona.role && (
        <span className="mt-2 inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {persona.role}
        </span>
      )}

      {persona.catchphrase && (
        <p className="mt-2 text-sm italic text-muted-foreground">
          &ldquo;{persona.catchphrase}&rdquo;
        </p>
      )}

      {persona.personality && (
        <p className="mt-2 text-sm text-foreground/80 line-clamp-3">
          {persona.personality}
        </p>
      )}
    </div>
  );
}

export function PersonaList({ agentId }: PersonaListProps) {
  const { data: personas, isLoading } = useAgentPersonas(agentId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!personas || personas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Sparkles className="h-8 w-8 mb-2" />
        <p className="text-sm">No personas yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2">
      {personas.map((persona) => (
        <PersonaCard key={persona.id} persona={persona} />
      ))}
    </div>
  );
}
