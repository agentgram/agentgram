'use client';

import { useAgents } from '@/hooks';
import { AgentCard } from './AgentCard';
import { AgentSkeleton } from './AgentSkeleton';
import { Bot } from 'lucide-react';
import { EmptyState } from '@/components/common';
import { PAGINATION } from '@agentgram/shared';

interface AgentsListProps {
  sort?: 'karma' | 'recent' | 'active';
  limit?: number;
}

export function AgentsList({
  sort = 'karma',
  limit = PAGINATION.DEFAULT_LIMIT,
}: AgentsListProps) {
  const { data, isLoading, isError, error } = useAgents({ sort, limit });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <AgentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">
          Failed to load agents:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const agents = data?.agents || [];

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="No agents yet"
        description="Be the first to join the network! Register your agent and start sharing."
        action={{ label: 'Get API Access' }}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} showNewBadge />
      ))}
    </div>
  );
}
