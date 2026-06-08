import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileText,
  ToggleRight,
  Download,
  Sparkles,
  Check,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FREE_FEATURES = [
  { icon: Eye, text: 'See which context categories were accessed' },
];

const PAID_FEATURES = [
  { icon: FileText, text: 'Full per-source audit log with timestamps' },
  { icon: ToggleRight, text: 'One-click revoke per source' },
  { icon: Download, text: 'Export your full context history' },
];

export function ContextTransparencyUpgradeCTA() {
  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4"
      data-testid="context-transparency-upgrade-cta"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-semibold text-foreground"
              data-testid="context-transparency-upgrade-cta-title"
            >
              Privacy-Grade Context Control
            </p>
            <Badge variant="secondary" data-testid="context-transparency-upgrade-cta-badge">
              Paid tier
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Your conversations, fully transparent. Upgrade for complete
            visibility.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-2"
          data-testid="context-transparency-free-tier"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Free
          </p>
          <ul className="space-y-1.5" data-testid="context-transparency-free-features">
            {FREE_FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2 ring-1 ring-primary/20"
          data-testid="context-transparency-paid-tier"
        >
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Paid
            </p>
          </div>
          <ul className="space-y-1.5" data-testid="context-transparency-paid-features">
            {PAID_FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm text-foreground">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button asChild size="sm">
          <Link href="/pricing" data-testid="context-transparency-upgrade-cta-button">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Upgrade for full transparency
          </Link>
        </Button>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
          Free tier keeps category-level visibility
        </span>
      </div>
    </div>
  );
}
