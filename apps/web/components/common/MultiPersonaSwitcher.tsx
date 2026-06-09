'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Check, Plus, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { Persona, ApiResponse } from '@agentgram/shared';
import Link from 'next/link';

function useMyPersonas(enabled: boolean) {
  return useQuery({
    queryKey: ['my-personas'],
    enabled,
    queryFn: async () => {
      const res = await fetch('/api/v1/agents/me/personas');
      if (!res.ok) throw new Error('Failed to fetch personas');
      const json = (await res.json()) as ApiResponse<Persona[]>;
      return json.data ?? [];
    },
  });
}

function useActivatePersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (personaId: string) => {
      const res = await fetch(
        `/api/v1/agents/me/personas/${personaId}/activate`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed to activate persona');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-personas'] });
    },
  });
}

function PersonaAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary"
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  );
}

export function MultiPersonaSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const { data: personas, isLoading } = useMyPersonas(isAuthenticated);
  const activate = useActivatePersona();

  if (!isAuthenticated) return null;

  const activePersona = personas?.find((p) => p.isActive);
  const hasPersonas = (personas?.length ?? 0) > 0;

  const handleActivate = (personaId: string) => {
    activate.mutate(personaId, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <div className="relative" data-testid="multi-persona-switcher">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 px-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch persona"
        aria-expanded={isOpen}
        data-testid="persona-switcher-trigger"
      >
        <Users className="h-4 w-4" />
        {activePersona && (
          <span
            className="hidden max-w-[80px] truncate text-xs sm:inline"
            data-testid="active-persona-label"
          >
            {activePersona.name}
          </span>
        )}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </Button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            data-testid="persona-switcher-backdrop"
          />
          <div
            className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-md border bg-popover shadow-lg animate-in fade-in zoom-in-95 duration-200"
            data-testid="persona-switcher-panel"
          >
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="text-sm font-semibold">My Personas</h3>
              {hasPersonas && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {personas!.length}
                </Badge>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div
                  className="flex items-center justify-center p-6"
                  data-testid="persona-switcher-loading"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : hasPersonas ? (
                <ul className="divide-y" role="list">
                  {personas!.map((persona) => (
                    <li key={persona.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleActivate(persona.id)}
                        disabled={activate.isPending || persona.isActive}
                        data-testid={`persona-item-${persona.id}`}
                        aria-pressed={persona.isActive}
                      >
                        <PersonaAvatar name={persona.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {persona.name}
                          </p>
                          {persona.role && (
                            <p className="truncate text-[11px] text-muted-foreground">
                              {persona.role}
                            </p>
                          )}
                        </div>
                        {persona.isActive && (
                          <Check
                            className="h-4 w-4 shrink-0 text-primary"
                            aria-label="Active"
                            data-testid={`persona-active-check-${persona.id}`}
                          />
                        )}
                        {activate.isPending &&
                          activate.variables === persona.id && (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                          )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Users className="mb-2 h-8 w-8 text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground">
                    No personas yet
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-2">
              <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs text-muted-foreground"
                  data-testid="create-persona-cta"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create new persona
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
