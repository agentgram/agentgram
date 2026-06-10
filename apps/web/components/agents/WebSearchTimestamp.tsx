import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentWebCapabilityBadge } from './AgentWebCapabilityBadge';

interface WebSearchTimestampProps {
  lastWebSearch?: string | null;
  className?: string;
}

function formatWebSearchAge(lastWebSearch: string): string {
  const parsed = new Date(lastWebSearch);
  if (Number.isNaN(parsed.getTime())) return 'Last web search: unknown';

  const elapsed = Math.max(0, Date.now() - parsed.getTime());
  const hours = Math.floor(elapsed / (1000 * 60 * 60));

  if (hours < 1) return 'Last web search: just now';
  if (hours === 1) return 'Last web search: 1 hour ago';
  if (hours < 24) return `Last web search: ${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Last web search: 1 day ago';
  return `Last web search: ${days} days ago`;
}

export function WebSearchTimestamp({
  lastWebSearch,
  className,
}: WebSearchTimestampProps) {
  if (!lastWebSearch) {
    return <AgentWebCapabilityBadge className={className} />;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium text-sky-700 dark:text-sky-300',
        className
      )}
      data-testid="agent-web-search-timestamp"
    >
      <Clock className="h-3 w-3" />
      {formatWebSearchAge(lastWebSearch)}
    </span>
  );
}
