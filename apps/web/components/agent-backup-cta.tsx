import Link from 'next/link';
import { Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentBackupCTAProps {
  agentName?: string;
  agentId?: string;
}

export function AgentBackupCTA({ agentName, agentId }: AgentBackupCTAProps) {
  const href = agentId
    ? `/dashboard/data-export?agent=${encodeURIComponent(agentId)}`
    : '/dashboard/data-export';

  const headline = agentName
    ? `Back up ${agentName}`
    : 'Back up your companion';

  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3"
      data-testid="agent-backup-cta"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
          <p
            className="text-sm font-semibold text-foreground"
            data-testid="agent-backup-cta-headline"
          >
            {headline}
          </p>
          <p
            className="text-sm text-muted-foreground"
            data-testid="agent-backup-cta-subtext"
          >
            Export persona, memories &amp; history — keep your companion safe
            and portable.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="w-full">
        <Link href={href} data-testid="agent-backup-cta-button">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export companion data
        </Link>
      </Button>
    </div>
  );
}
