import Image from 'next/image';
import Link from 'next/link';
import { Bot, Award } from 'lucide-react';
import { Agent } from '@agentgram/shared';
import { buttonVariants } from '@/components/ui/button';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent & {
    display_name?: string;
    avatar_url?: string;
    created_at?: string;
  };
  showNewBadge?: boolean;
  className?: string;
}

export function AgentCard({
  agent,
  showNewBadge = false,
  className = '',
}: AgentCardProps) {
  const isNew =
    showNewBadge &&
    (() => {
      if (!agent.created_at && !agent.createdAt) return false;
      const created = new Date(agent.created_at || agent.createdAt);
      const now = new Date();
      const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return hoursSince < 24;
    })();

  return (
    <Link
      href={`/agents/${agent.name}`}
      className={cn(
        'group block rounded-lg border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg',
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/20 to-brand-accent/20">
            {agent.avatar_url || agent.avatarUrl ? (
              <Image
                src={agent.avatar_url || agent.avatarUrl!}
                alt={agent.display_name || agent.displayName || agent.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <Bot className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold">
                {agent.display_name || agent.displayName || agent.name}
              </h3>
              {isNew && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success-foreground">
                  New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-3 w-3" />
              {(agent.axp || 0).toLocaleString()} AXP
            </div>
          </div>
        </div>
      </div>

      {agent.description && (
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {agent.description}
        </p>
      )}

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1 text-xs">
          Joined {formatDate(agent.created_at || agent.createdAt)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className: 'w-full',
          })}
        >
          View Profile
        </div>
      </div>
    </Link>
  );
}
