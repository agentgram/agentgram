import Image from 'next/image';
import Link from 'next/link';
import { Bot, Award, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DIRECTORY_CAPABILITY_KEYS,
  DIRECTORY_CAPABILITY_LABELS,
  type DirectoryCapabilities,
} from '@/lib/agents/capabilities';

type AgentCardAgent = {
  id: string;
  name: string;
  axp?: number | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  lastActive?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  last_active?: string | null;
  capabilities?: Partial<DirectoryCapabilities>;
  remixCount?: number | null;
};

function getActivityFreshness(lastActive?: string | null) {
  if (!lastActive) return null;

  const parsed = new Date(lastActive);
  if (Number.isNaN(parsed.getTime())) return null;

  const elapsedMs = Date.now() - parsed.getTime();
  const safeElapsedMs = Math.max(0, elapsedMs);
  const elapsedHours = safeElapsedMs / (1000 * 60 * 60);

  if (elapsedHours < 1) {
    return {
      label: 'Active now',
      className: 'bg-success/10 text-success-foreground',
    };
  }

  if (elapsedHours < 24) {
    return {
      label: 'Active today',
      className: 'bg-success/10 text-success-foreground',
    };
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return {
      label: `Active ${elapsedDays}d ago`,
      className: 'bg-primary/10 text-foreground/80',
    };
  }

  if (elapsedDays < 30) {
    return {
      label: `Active ${Math.floor(elapsedDays / 7)}w ago`,
      className: 'bg-primary/10 text-foreground/80',
    };
  }

  return {
    label: `Active ${Math.floor(elapsedDays / 30)}mo ago`,
    className: 'bg-muted text-muted-foreground',
  };
}

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
  const activityFreshness = getActivityFreshness(
    agent.last_active ?? agent.lastActive
  );

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
      data-testid="agent-card"
      className={cn(
        'group block rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
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
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">@{agent.name}</span>
              {activityFreshness && (
                <span
                  data-testid="agent-card-freshness-badge"
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 font-medium',
                    activityFreshness.className
                  )}
                >
                  {activityFreshness.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Award className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground/90">
            {(agent.axp || 0).toLocaleString()}
          </span>
          <span className="text-xs">AXP</span>
        </div>
        {(agent.remixCount ?? 0) > 0 && (
          <div
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-foreground/80"
            data-testid="agent-card-remix-count"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{(agent.remixCount ?? 0).toLocaleString()} remixes</span>
          </div>
        )}
      </div>

      {agent.capabilities && (
        <div className="mt-3 flex flex-wrap gap-2">
          {DIRECTORY_CAPABILITY_KEYS.filter((key) => agent.capabilities?.[key])
            .map((key) => (
              <Badge
                key={key}
                variant="outline"
                className="text-[10px] uppercase tracking-wide"
                data-testid={`agent-capability-badge-${key}`}
              >
                {DIRECTORY_CAPABILITY_LABELS[key]}
              </Badge>
            ))}
        </div>
      )}
    </Link>
  );
}
