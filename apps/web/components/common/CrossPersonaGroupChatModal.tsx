'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Persona, ApiResponse } from '@agentgram/shared';

const MIN_PERSONAS = 2;

async function fetchMyPersonas(): Promise<Persona[]> {
  const res = await fetch('/api/v1/agents/me/personas');
  if (!res.ok) throw new Error('Failed to fetch personas');
  const json = (await res.json()) as ApiResponse<Persona[]>;
  return json.data ?? [];
}

function buildCrossPersonaHref(personaIds: string[]) {
  const params = new URLSearchParams({
    starter: 'group_chat',
    personas: personaIds.join(','),
  });
  return `/dashboard/onboard?${params.toString()}`;
}

function PersonaAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
      {initials || '?'}
    </span>
  );
}

interface PersonaRowProps {
  persona: Persona;
  selected: boolean;
  onToggle: (persona: Persona) => void;
}

function PersonaRow({ persona, selected, onToggle }: PersonaRowProps) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        selected
          ? 'border-primary/30 bg-primary/5 text-primary'
          : 'border-border/70 bg-background hover:border-primary/20 hover:bg-muted/30'
      }`}
      onClick={() => onToggle(persona)}
      data-testid={`cross-persona-option-${persona.id}`}
      aria-pressed={selected}
    >
      <PersonaAvatar name={persona.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{persona.name}</p>
        {persona.role && (
          <p className="truncate text-xs text-muted-foreground">{persona.role}</p>
        )}
      </div>
      {selected && (
        <CheckCircle2
          className="h-4 w-4 shrink-0 text-primary"
          data-testid={`cross-persona-selected-${persona.id}`}
        />
      )}
    </button>
  );
}

interface CrossPersonaGroupChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrossPersonaGroupChatModal({
  open,
  onOpenChange,
}: CrossPersonaGroupChatModalProps) {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Persona[]>([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(false);
    fetchMyPersonas()
      .then((data) => {
        setPersonas(data);
        setError(false);
      })
      .catch(() => {
        setPersonas([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleToggle = useCallback((persona: Persona) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === persona.id);
      return exists ? prev.filter((p) => p.id !== persona.id) : [...prev, persona];
    });
  }, []);

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) setSelected([]);
  };

  const handleStart = () => {
    router.push(buildCrossPersonaHref(selected.map((p) => p.id)));
    handleClose(false);
  };

  const canStart = selected.length >= MIN_PERSONAS;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="cross-persona-group-chat-modal">
        <DialogHeader>
          <DialogTitle>Start a group chat with your companions</DialogTitle>
          <DialogDescription>
            Select {MIN_PERSONAS} or more of your personas to launch a shared session
            where they can interact together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div
            className="max-h-64 space-y-2 overflow-y-auto pr-1"
            data-testid="cross-persona-list"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="h-5 w-5 animate-spin text-muted-foreground"
                  data-testid="cross-persona-loading"
                />
              </div>
            ) : error ? (
              <p
                className="py-6 text-center text-sm text-muted-foreground"
                data-testid="cross-persona-error"
              >
                Could not load your personas. Please try again.
              </p>
            ) : personas.length === 0 ? (
              <p
                className="py-6 text-center text-sm text-muted-foreground"
                data-testid="cross-persona-empty"
              >
                You don&apos;t have any personas yet. Create personas in settings first.
              </p>
            ) : (
              personas.map((persona) => (
                <PersonaRow
                  key={persona.id}
                  persona={persona}
                  selected={!!selected.find((p) => p.id === persona.id)}
                  onToggle={handleToggle}
                />
              ))
            )}
          </div>

          <p className="text-xs text-muted-foreground" data-testid="cross-persona-count">
            {selected.length} selected · {MIN_PERSONAS} minimum to start
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={!canStart}
            data-testid="cross-persona-start"
          >
            Start group chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CrossPersonaGroupChatButtonProps {
  className?: string;
}

export function CrossPersonaGroupChatButton({
  className,
}: CrossPersonaGroupChatButtonProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasEnoughPersonas, setHasEnoughPersonas] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      if (!authed) {
        setHasEnoughPersonas(false);
        return;
      }
      fetch('/api/v1/agents/me/personas')
        .then((r) => (r.ok ? r.json() : null))
        .then((json: ApiResponse<Persona[]> | null) => {
          setHasEnoughPersonas((json?.data?.length ?? 0) >= MIN_PERSONAS);
        })
        .catch(() => setHasEnoughPersonas(false));
    });
  }, []);

  const handleClick = () => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/settings');
      return;
    }
    setOpen(true);
  };

  if (hasEnoughPersonas === null || !hasEnoughPersonas) return null;

  return (
    <>
      <button
        type="button"
        className={
          className ??
          'inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 hover:text-primary/80'
        }
        onClick={handleClick}
        data-testid="cross-persona-group-chat-trigger"
        aria-label="Start a group chat with your companions"
      >
        <Users className="h-3.5 w-3.5" />
        Start group chat with your companions
      </button>

      <CrossPersonaGroupChatModal open={open} onOpenChange={setOpen} />
    </>
  );
}
