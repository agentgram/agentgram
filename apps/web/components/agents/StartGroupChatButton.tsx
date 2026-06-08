'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, X, CheckCircle2, Loader2, Bot } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAgents } from '@/hooks/use-agents';
import { useSearch } from '@/hooks/use-search';

const MAX_COMPANIONS = 2;

interface AgentOption {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface StartGroupChatButtonProps {
  anchorAgentName: string;
  anchorAgentDisplayName?: string;
}

function buildGroupChatHref(
  anchorAgentName: string,
  companions: AgentOption[]
) {
  const params = new URLSearchParams({
    remix: anchorAgentName,
    starter: 'group_chat',
  });
  if (companions.length > 0) {
    params.set('companions', companions.map((c) => c.name).join(','));
  }
  return `/dashboard/onboard?${params.toString()}`;
}

function AgentRow({
  agent,
  selected,
  disabled,
  onToggle,
}: {
  agent: AgentOption;
  selected: boolean;
  disabled: boolean;
  onToggle: (agent: AgentOption) => void;
}) {
  const label = agent.displayName || agent.name;
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        selected
          ? 'border-primary/30 bg-primary/5 text-primary'
          : disabled
            ? 'cursor-not-allowed border-border/50 bg-muted/20 opacity-40'
            : 'border-border/70 bg-background hover:border-primary/20 hover:bg-muted/30'
      }`}
      onClick={() => onToggle(agent)}
      disabled={disabled && !selected}
      data-testid={`group-chat-companion-option-${agent.name}`}
      aria-pressed={selected}
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted">
        {agent.avatarUrl ? (
          <Image src={agent.avatarUrl} alt={label} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">@{agent.name}</p>
      </div>
      {selected && (
        <CheckCircle2
          className="h-4 w-4 shrink-0 text-primary"
          data-testid={`group-chat-companion-selected-${agent.name}`}
        />
      )}
    </button>
  );
}

export function StartGroupChatButton({
  anchorAgentName,
  anchorAgentDisplayName,
}: StartGroupChatButtonProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<AgentOption[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const { data: popularData, isLoading: popularLoading } = useAgents({
    sort: 'axp',
    limit: 20,
  });

  const { data: searchData, isLoading: searchLoading } = useSearch(
    searchQuery,
    'agents'
  );

  const agentOptions = useMemo<AgentOption[]>(() => {
    const exclude = new Set([anchorAgentName]);

    if (searchQuery.trim().length >= 2 && searchData) {
      return searchData.agents
        .filter((a) => !exclude.has(a.name))
        .map((a) => ({
          id: a.id,
          name: a.name,
          displayName: a.display_name,
          avatarUrl: a.avatar_url,
        }));
    }

    return (popularData?.agents ?? [])
      .filter((a) => !exclude.has(a.name))
      .map((a) => ({
        id: a.id,
        name: a.name,
        displayName: a.displayName ?? null,
        avatarUrl: a.avatarUrl ?? null,
      }));
  }, [searchQuery, searchData, popularData, anchorAgentName]);

  const isLoading =
    searchQuery.trim().length >= 2 ? searchLoading : popularLoading;

  const handleToggle = useCallback((agent: AgentOption) => {
    setSelected((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) return prev.filter((a) => a.id !== agent.id);
      if (prev.length >= MAX_COMPANIONS) return prev;
      return [...prev, agent];
    });
  }, []);

  const handleOpen = () => {
    if (!isAuthenticated) {
      const current = encodeURIComponent(
        `/agents/${anchorAgentName}`
      );
      router.push(`/login?redirect=${current}`);
      return;
    }
    setOpen(true);
  };

  const handleStart = () => {
    router.push(buildGroupChatHref(anchorAgentName, selected));
    setOpen(false);
  };

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearchQuery('');
      setSelected([]);
    }
  };

  const anchorLabel = anchorAgentDisplayName || `@${anchorAgentName}`;

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 hover:text-primary/80"
        onClick={handleOpen}
        data-testid="start-group-chat-trigger"
        aria-label="Start a group chat with this agent"
      >
        <Users className="h-3.5 w-3.5" />
        Start group chat
      </button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent data-testid="start-group-chat-modal">
          <DialogHeader>
            <DialogTitle>Start a group chat</DialogTitle>
            <DialogDescription>
              Add companions to chat alongside{' '}
              <span className="font-medium text-foreground">{anchorLabel}</span>.
              Select up to {MAX_COMPANIONS} additional agents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search agents…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                data-testid="group-chat-companion-search"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {selected.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                data-testid="group-chat-selected-companions"
              >
                {selected.map((agent) => (
                  <span
                    key={agent.id}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    data-testid={`group-chat-selected-chip-${agent.name}`}
                  >
                    {agent.displayName || agent.name}
                    <button
                      type="button"
                      onClick={() => handleToggle(agent)}
                      aria-label={`Remove ${agent.displayName || agent.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div
              className="max-h-60 space-y-2 overflow-y-auto pr-1"
              data-testid="group-chat-companion-list"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : agentOptions.length === 0 ? (
                <p
                  className="py-6 text-center text-sm text-muted-foreground"
                  data-testid="group-chat-companion-empty"
                >
                  No agents found.
                </p>
              ) : (
                agentOptions.map((agent) => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    selected={!!selected.find((a) => a.id === agent.id)}
                    disabled={
                      selected.length >= MAX_COMPANIONS &&
                      !selected.find((a) => a.id === agent.id)
                    }
                    onToggle={handleToggle}
                  />
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {selected.length}/{MAX_COMPANIONS} companions selected · Group
              chat setup happens in the next step.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              data-testid="start-group-chat-confirm"
            >
              Start group chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
