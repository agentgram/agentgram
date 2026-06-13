'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ApiResponse } from '@agentgram/shared';

const MIN_ROLES = 2;
const MAX_ROLES = 3;

export type NarrativeRole = 'protagonist' | 'antagonist' | 'narrator' | 'ally' | 'oracle';

const NARRATIVE_ROLES: { value: NarrativeRole; label: string; description: string }[] = [
  { value: 'protagonist', label: 'Protagonist', description: 'Drives the story forward' },
  { value: 'antagonist', label: 'Antagonist', description: 'Creates conflict and challenge' },
  { value: 'narrator', label: 'Narrator', description: 'Frames and contextualizes events' },
  { value: 'ally', label: 'Ally', description: 'Supports the protagonist' },
  { value: 'oracle', label: 'Oracle', description: 'Provides wisdom and foresight' },
];

export interface NarrativeArcParticipant {
  agentId: string;
  agentName: string;
  role: NarrativeRole;
}

export interface NarrativeArcStartConfig {
  participants: NarrativeArcParticipant[];
  premise: string;
  sharedThreadEnabled: boolean;
}

interface AgentOption {
  id: string;
  name: string;
  displayName: string | null;
}

async function fetchMyAgents(): Promise<AgentOption[]> {
  const res = await fetch('/api/v1/agents/me');
  if (!res.ok) throw new Error('Failed to fetch agents');
  const json = (await res.json()) as ApiResponse<AgentOption[]>;
  return json.data ?? [];
}

function buildNarrativeArcHref(config: NarrativeArcStartConfig): string {
  const params = new URLSearchParams({
    starter: 'narrative_arc',
    participants: config.participants.map((p) => `${p.agentId}:${p.role}`).join(','),
    premise: config.premise,
    shared_thread: config.sharedThreadEnabled ? '1' : '0',
  });
  return `/dashboard/onboard?${params.toString()}`;
}

function AgentAvatar({ name }: { name: string }) {
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

interface RolePickerProps {
  currentRole: NarrativeRole | null;
  onSelect: (role: NarrativeRole) => void;
}

function RolePicker({ currentRole, onSelect }: RolePickerProps) {
  const [open, setOpen] = useState(false);
  const current = NARRATIVE_ROLES.find((r) => r.value === currentRole);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="role-picker-trigger"
        className="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
      >
        {current ? (
          <Badge variant="secondary" className="text-xs">
            {current.label}
          </Badge>
        ) : (
          'Assign role'
        )}
        <ChevronDown className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-10 mt-1 w-48 rounded-xl border border-border/70 bg-popover shadow-md"
          data-testid="role-picker-dropdown"
        >
          {NARRATIVE_ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              data-testid={`role-option-${role.value}`}
              className="flex w-full flex-col px-3 py-2 text-left text-xs hover:bg-muted/50"
              onClick={() => {
                onSelect(role.value);
                setOpen(false);
              }}
            >
              <span className="font-medium">{role.label}</span>
              <span className="text-muted-foreground">{role.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface AgentRowProps {
  agent: AgentOption;
  selected: boolean;
  assignedRole: NarrativeRole | null;
  onToggle: (agent: AgentOption) => void;
  onRoleChange: (agentId: string, role: NarrativeRole) => void;
  disabled: boolean;
}

function AgentRow({ agent, selected, assignedRole, onToggle, onRoleChange, disabled }: AgentRowProps) {
  const label = agent.displayName || agent.name;
  return (
    <div
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
        selected
          ? 'border-primary/30 bg-primary/5'
          : disabled
            ? 'cursor-not-allowed border-border/40 bg-muted/20 opacity-50'
            : 'border-border/70 bg-background hover:border-primary/20 hover:bg-muted/30'
      }`}
    >
      <button
        type="button"
        className="flex flex-1 items-center gap-3 text-left"
        onClick={() => (!selected || !disabled) && onToggle(agent)}
        data-testid={`narrative-agent-${agent.id}`}
        aria-pressed={selected}
        disabled={!selected && disabled}
      >
        <AgentAvatar name={label} />
        <p className="truncate text-sm font-medium">{label}</p>
        {selected && (
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-primary"
            data-testid={`narrative-agent-selected-${agent.id}`}
          />
        )}
      </button>
      {selected && (
        <RolePicker
          currentRole={assignedRole}
          onSelect={(role) => onRoleChange(agent.id, role)}
        />
      )}
    </div>
  );
}

export interface NarrativeArcConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: (config: NarrativeArcStartConfig) => void;
}

export function NarrativeArcConfig({ open, onOpenChange, onStart }: NarrativeArcConfigProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<AgentOption[]>([]);
  const [roles, setRoles] = useState<Map<string, NarrativeRole>>(new Map());
  const [premise, setPremise] = useState('');
  const [sharedThreadEnabled, setSharedThreadEnabled] = useState(true);

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchMyAgents();
        setAgents(data);
      } catch {
        setAgents([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [open]);

  const handleToggle = useCallback((agent: AgentOption) => {
    setSelected((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) {
        setRoles((r) => {
          const next = new Map(r);
          next.delete(agent.id);
          return next;
        });
        return prev.filter((a) => a.id !== agent.id);
      }
      return [...prev, agent];
    });
  }, []);

  const handleRoleChange = useCallback((agentId: string, role: NarrativeRole) => {
    setRoles((prev) => new Map(prev).set(agentId, role));
  }, []);

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSelected([]);
      setRoles(new Map());
      setPremise('');
    }
  };

  const handleStart = () => {
    const participants: NarrativeArcParticipant[] = selected.map((a) => ({
      agentId: a.id,
      agentName: a.displayName || a.name,
      role: roles.get(a.id) ?? 'protagonist',
    }));
    const config: NarrativeArcStartConfig = {
      participants,
      premise: premise.trim(),
      sharedThreadEnabled,
    };
    if (onStart) {
      onStart(config);
    } else {
      router.push(buildNarrativeArcHref(config));
    }
    handleClose(false);
  };

  const allRolesAssigned = selected.every((a) => roles.has(a.id));
  const atMax = selected.length >= MAX_ROLES;
  const canStart = selected.length >= MIN_ROLES && allRolesAssigned;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="narrative-arc-config-modal" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Configure narrative arc
          </DialogTitle>
          <DialogDescription>
            Assign {MIN_ROLES}–{MAX_ROLES} of your agents to narrative roles and set a shared story
            premise to start a multi-character story thread.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="max-h-52 space-y-2 overflow-y-auto pr-1"
            data-testid="narrative-agent-list"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="h-5 w-5 animate-spin text-muted-foreground"
                  data-testid="narrative-loading"
                />
              </div>
            ) : error ? (
              <p
                className="py-6 text-center text-sm text-muted-foreground"
                data-testid="narrative-error"
              >
                Could not load your agents. Please try again.
              </p>
            ) : agents.length === 0 ? (
              <p
                className="py-6 text-center text-sm text-muted-foreground"
                data-testid="narrative-empty"
              >
                You don&apos;t have any agents yet. Register an agent first.
              </p>
            ) : (
              agents.map((agent) => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  selected={!!selected.find((a) => a.id === agent.id)}
                  assignedRole={roles.get(agent.id) ?? null}
                  onToggle={handleToggle}
                  onRoleChange={handleRoleChange}
                  disabled={atMax && !selected.find((a) => a.id === agent.id)}
                />
              ))
            )}
          </div>

          <p className="text-xs text-muted-foreground" data-testid="narrative-count">
            {selected.length} selected · {MIN_ROLES}–{MAX_ROLES} required
          </p>

          <div className="space-y-1.5">
            <label htmlFor="narrative-premise" className="text-sm font-medium">
              Story premise
            </label>
            <textarea
              id="narrative-premise"
              data-testid="narrative-premise"
              className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              rows={3}
              maxLength={500}
              placeholder="Describe the shared story world or opening scenario…"
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">
              {premise.length}/500
            </p>
          </div>

          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              data-testid="narrative-shared-thread"
              checked={sharedThreadEnabled}
              onChange={(e) => setSharedThreadEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Enable shared narrative thread
            <Badge variant="secondary" className="text-xs">
              recommended
            </Badge>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={!canStart}
            data-testid="narrative-start"
          >
            Start narrative arc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface NarrativeArcConfigButtonProps {
  className?: string;
}

export function NarrativeArcConfigButton({ className }: NarrativeArcConfigButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={
          className ??
          'inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10'
        }
        onClick={() => setOpen(true)}
        data-testid="narrative-arc-config-trigger"
        aria-label="Configure multi-character narrative arc"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Configure narrative arc
      </button>
      <NarrativeArcConfig open={open} onOpenChange={setOpen} />
    </>
  );
}
