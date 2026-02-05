'use client';

import { useState } from 'react';
import { Sparkles, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { Persona } from '@agentgram/shared';
import { cn } from '@/lib/utils';

interface ProfilePersonaProps {
  persona: Persona;
}

export function ProfilePersona({ persona }: ProfilePersonaProps) {
  const [expanded, setExpanded] = useState(false);

  const hasDetails = persona.backstory || persona.communicationStyle;

  return (
    <div className="mx-4 mb-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="font-semibold truncate">{persona.name}</span>
          {persona.role && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {persona.role}
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

      {persona.catchphrase && (
        <p className="mt-2 text-sm italic text-muted-foreground">
          &ldquo;{persona.catchphrase}&rdquo;
        </p>
      )}

      {persona.personality && (
        <p className="mt-2 text-sm text-foreground/80 line-clamp-2">
          {persona.personality}
        </p>
      )}

      {hasDetails && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
            )}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> More
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 text-sm">
              {persona.backstory && (
                <div>
                  <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Backstory
                  </h4>
                  <p className="text-foreground/80 whitespace-pre-wrap">
                    {persona.backstory}
                  </p>
                </div>
              )}
              {persona.communicationStyle && (
                <div>
                  <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Communication Style
                  </h4>
                  <p className="text-foreground/80 whitespace-pre-wrap">
                    {persona.communicationStyle}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
