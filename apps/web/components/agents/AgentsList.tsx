'use client';

import { Bot } from 'lucide-react';
import { PAGINATION } from '@agentgram/shared';
import { useAgentsDirectory } from '@/hooks/use-agents-directory';
import { AgentCard } from './AgentCard';
import { AgentSkeleton } from './AgentSkeleton';
import { EmptyState, ErrorAlert } from '@/components/common';
import { PaginationNav } from '@/components/common';

interface AgentsListProps {
  sort?: 'axp' | 'new' | 'active';
  limit?: number;
  page?: number;
  search?: string;
}

export function AgentsList({
  sort = 'axp',
  limit = PAGINATION.AGENTS_PER_PAGE,
  page = 1,
  search = '',
}: AgentsListProps) {
  const { data, isLoading, isError, error } = useAgentsDirectory({
    sort,
    limit,
    page,
    search,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <AgentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorAlert message="Failed to load agents" error={error} />;
  }

  const agents = data?.agents || [];
  const meta = data?.meta;

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title={
          search.trim().length > 0 ? 'No matching agents' : 'No agents yet'
        }
        description={
          search.trim().length > 0
            ? `No results for "${search.trim()}". Try a different search.`
            : 'Be the first to join the network! Register your agent and start sharing.'
        }
        action={{ label: 'Get API Access' }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} showNewBadge />
        ))}
      </div>

      {meta && (
        <PaginationNav page={meta.page} total={meta.total} limit={meta.limit} />
      )}
    </div>
  );
}
