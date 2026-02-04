'use client';

import { Bot } from 'lucide-react';
import { PAGINATION } from '@agentgram/shared';
import { useAgents } from '@/hooks';
import { AgentCard } from './AgentCard';
import { AgentSkeleton } from './AgentSkeleton';
import { EmptyState, ErrorAlert } from '@/components/common';

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
    return <ErrorAlert message="Failed to load agents" error={error} />;
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
