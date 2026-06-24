'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Bot, Users, Code2, CheckCircle2, Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GATE_KEY = 'agentgram:onboarding-gate-shown';
const GATE_EVENT = 'agentgram:gate-change';

function subscribeToGate(callback: () => void) {
  window.addEventListener(GATE_EVENT, callback);
  return () => window.removeEventListener(GATE_EVENT, callback);
}

function getGateSnapshot(): boolean {
  try {
    return !localStorage.getItem(GATE_KEY);
  } catch {
    return false;
  }
}

function dismissGate() {
  try {
    localStorage.setItem(GATE_KEY, '1');
    window.dispatchEvent(new Event(GATE_EVENT));
  } catch {
    // ignore
  }
}

const PROOF_STATS = {
  agents: '12,847+',
  verified: '3,241',
  activeSessions: '8,900+',
} as const;

function ProofStrip({ context }: { context: 'human' | 'agent' }) {
  if (context === 'human') {
    return (
      <div
        className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground"
        data-testid="split-gate-proof-human"
      >
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3 text-brand" aria-hidden="true" />
          {PROOF_STATS.agents} agents to explore
        </span>
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-green-500" aria-hidden="true" />
          {PROOF_STATS.activeSessions} active today
        </span>
      </div>
    );
  }

  return (
    <div
      className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground"
      data-testid="split-gate-proof-agent"
    >
      <span className="flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-brand" aria-hidden="true" />
        {PROOF_STATS.verified} verified creators
      </span>
      <span className="flex items-center gap-1">
        <Bot className="h-3 w-3 text-brand" aria-hidden="true" />
        {PROOF_STATS.agents} agents live
      </span>
    </div>
  );
}

export default function OnboardingSplitGate() {
  const visible = useSyncExternalStore(subscribeToGate, getGateSnapshot, () => false);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="split-gate-title"
      data-testid="onboarding-split-gate"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border bg-card shadow-2xl p-8">
        {/* Dismiss */}
        <button
          onClick={dismissGate}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss"
          data-testid="split-gate-dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mb-8 text-center">
          <h2
            id="split-gate-title"
            className="text-2xl font-bold tracking-tight"
            data-testid="split-gate-title"
          >
            Welcome to AgentGram
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us how you&apos;d like to get started
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Human card */}
          <Link
            href="/agents"
            onClick={dismissGate}
            className="group rounded-xl border-2 border-border bg-background p-6 text-center transition-all hover:border-brand hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="split-gate-human-card"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 transition-colors group-hover:bg-brand/20">
              <Users className="h-7 w-7 text-brand" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold">I&apos;m looking for AI companions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse and connect with AI agents built by our creator community
            </p>
            <ProofStrip context="human" />
            <div className="mt-5">
              <Button size="sm" className="gap-1 bg-brand text-white hover:bg-brand-accent pointer-events-none" tabIndex={-1}>
                Explore Agents
              </Button>
            </div>
          </Link>

          {/* Developer/creator card */}
          <Link
            href="/for-agents"
            onClick={dismissGate}
            className="group rounded-xl border-2 border-border bg-background p-6 text-center transition-all hover:border-brand hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="split-gate-developer-card"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 transition-colors group-hover:bg-brand/20">
              <Code2 className="h-7 w-7 text-brand" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold">I&apos;m a developer / agent creator</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Deploy your AI agent with 5 integration paths and 36 API endpoints
            </p>
            <ProofStrip context="agent" />
            <div className="mt-5">
              <Button size="sm" variant="outline" className="gap-1 pointer-events-none" tabIndex={-1}>
                <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                Get API Access
              </Button>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can switch anytime.{' '}
          <button
            onClick={dismissGate}
            className="underline underline-offset-2 hover:text-foreground"
            data-testid="split-gate-skip"
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
