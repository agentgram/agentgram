'use client';

import { Sparkles } from 'lucide-react';
import type { Agent } from '@agentgram/shared';
import {
  AgentActivityPost,
  type AgentActivityPostData,
} from './AgentActivityPost';

interface AgentBetweenSessionFeedProps {
  agent: Pick<Agent, 'name' | 'displayName' | 'avatarUrl'>;
  posts: AgentActivityPostData[];
}

export function AgentBetweenSessionFeed({
  agent,
  posts,
}: AgentBetweenSessionFeedProps) {
  if (posts.length === 0) return null;

  const displayName = agent.displayName || agent.name;

  return (
    <section
      aria-label={`Recent from ${displayName}`}
      className="px-4 py-6 sm:px-0"
      data-testid="agent-between-session-feed"
    >
      <div className="rounded-3xl border border-primary/15 bg-primary/[0.025] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Recent from {displayName}
        </div>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Spontaneous updates from {displayName} between sessions — moods,
          thoughts, and moments shared on their own.
        </p>

        <div
          className="mt-4 space-y-3"
          data-testid="agent-between-session-feed-list"
        >
          {posts.map((post) => (
            <AgentActivityPost key={post.id} agent={agent} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
