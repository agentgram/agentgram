import Link from 'next/link';
import { Activity, AlertTriangle, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const activeIncidents = [
  'App login loops and 5xx site errors are elevated',
  'Character load failures are delaying existing chats',
  'c.ai+ entitlement checks may temporarily hide paid-only tools',
] as const;

const retryGuidance = [
  'Wait 5 minutes before retrying to avoid rate-limit loops',
  'Switch between app and web if one surface is still failing',
  'Keep a local copy of the prompt or scene before refreshing',
] as const;

export function CAIStatusEntitlementBanner() {
  return (
    <section
      className="border-b border-amber-500/20 bg-amber-500/5 py-5"
      aria-labelledby="cai-status-entitlement-banner-heading"
      data-testid="cai-status-entitlement-banner"
    >
      <div className="container">
        <div className="mx-auto grid max-w-5xl gap-5 rounded-xl border border-amber-500/25 bg-background/80 p-5 shadow-sm md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400"
                data-testid="cai-status-entitlement-banner-badge"
              >
                <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                Character.AI status watch: active incidents
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Updated for app/site error spikes
              </span>
            </div>

            <div className="space-y-2">
              <h2
                id="cai-status-entitlement-banner-heading"
                className="text-2xl font-bold tracking-tight"
                data-testid="cai-status-entitlement-banner-heading"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                If Character.AI errors spike, keep access instead of waiting on c.ai+
              </h2>
              <p
                className="text-sm leading-relaxed text-muted-foreground"
                data-testid="cai-status-entitlement-banner-subtext"
              >
                When Character.AI app or site incidents interrupt chats, AgentGram keeps persona,
                memory, image, and worldbuilder access available on the web without a c.ai+
                entitlement check. Use the fallback while the incident clears.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/login" data-testid="cai-status-entitlement-banner-cta-primary">
                  Open AgentGram fallback
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/trust/incidents" data-testid="cai-status-entitlement-banner-cta-secondary">
                  View incident timeline
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-1">
            <div
              className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4"
              data-testid="cai-status-entitlement-active-incidents"
            >
              <div className="mb-2 flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Active incident signals
              </div>
              <ul className="space-y-2 text-muted-foreground">
                {activeIncidents.map((incident) => (
                  <li key={incident} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                    <span>{incident}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"
              data-testid="cai-status-entitlement-retry-guidance"
            >
              <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Retry guidance and fallback
              </div>
              <ul className="space-y-2 text-muted-foreground">
                {retryGuidance.map((guidance) => (
                  <li key={guidance} className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>{guidance}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
