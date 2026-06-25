import Link from 'next/link';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function GdprPrivacyCTA() {
  return (
    <div
      className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4"
      data-testid="gdpr-privacy-cta"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-semibold text-foreground"
              data-testid="gdpr-privacy-cta-headline"
            >
              Your data, your rights
            </p>
            <Badge variant="secondary" data-testid="gdpr-privacy-cta-badge">
              GDPR Article 20 compliant
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="gdpr-privacy-cta-subtext">
            Privacy Guard tier gives you encrypted export, 90-day retention
            guarantee, and a dedicated Data Processing Agreement — the same
            standard Replika was fined €5M for skipping.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button asChild size="sm">
          <Link
            href="/pricing#privacy-guard"
            data-testid="gdpr-privacy-cta-button"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            Upgrade to Privacy Guard
          </Link>
        </Button>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
          Privacy-grade data protection
        </span>
      </div>
    </div>
  );
}
