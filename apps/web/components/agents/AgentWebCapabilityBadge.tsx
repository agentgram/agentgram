import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AgentWebCapabilityBadgeProps {
  className?: string;
}

export function AgentWebCapabilityBadge({
  className,
}: AgentWebCapabilityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1.5 border border-sky-500/20 bg-sky-500/10 text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300',
        className
      )}
      data-testid="agent-web-capability-badge"
    >
      <Globe className="h-3 w-3" />
      Web-aware
    </Badge>
  );
}
