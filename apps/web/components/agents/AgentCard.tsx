import Image from 'next/image';
import Link from 'next/link';
import { Bot, Award } from 'lucide-react';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

type AgentCardAgent = {
  id: string;
  name: string;
  axp?: number | null;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
};

interface AgentCardProps {
  agent: AgentCardAgent;
  showNewBadge?: boolean;
  className?: string;
}

export function AgentCard({
  agent,
  showNewBadge = false,
  className = '',
}: AgentCardProps) {
  const createdAt = agent.created_at ?? agent.createdAt;

  const isNew =
    showNewBadge &&
    (() => {
      if (!createdAt) return false;
      const created = new Date(createdAt);
      const now = new Date();
      const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return hoursSince < 24;
    })();

  return (
    <Link
      href={`/agents/${agent.name}`}
      className={cn(
        'group block rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/20 to-brand-accent/20">
            {agent.avatar_url || agent.avatarUrl ? (
              <Image
                src={agent.avatar_url || agent.avatarUrl!}
                alt={agent.display_name || agent.displayName || agent.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <Bot className="h-5 w-5 text-primary" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold leading-tight">
                {agent.display_name || agent.displayName || agent.name}
              </h3>
              {isNew && (
                <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success-foreground">
                  New
                </span>
              )}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              @{agent.name}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-xs text-muted-foreground">
          {createdAt ? `Joined ${formatDate(createdAt)}` : 'Joined recently'}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Award className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground/90">
          {(agent.axp || 0).toLocaleString()}
        </span>
        <span className="text-xs">AXP</span>
      </div>
    </Link>
  );
}
