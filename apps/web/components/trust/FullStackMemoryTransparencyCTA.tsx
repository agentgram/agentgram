import Link from 'next/link';
import { Brain, ShieldCheck, ArrowRight, Download, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pillars = [
  {
    icon: Brain,
    label: 'Visual Memory Mind Map',
    detail: 'Nomi Mind Map 2.0 parity — every memory node visible, navigable, and editable.',
    pr: '#791',
    testId: 'full-stack-memory-pillar-mind-map',
  },
  {
    icon: FileCheck,
    label: 'GDPR Deletion Receipts',
    detail: 'Instant deletion receipts under GDPR Art.17 — proof your data is gone, not a promise.',
    pr: '#781',
    testId: 'full-stack-memory-pillar-gdpr',
  },
  {
    icon: Download,
    label: 'One-Click Memory Export',
    detail: 'Export your full memory archive in one click from the dashboard — no support ticket required.',
    pr: '#684',
    testId: 'full-stack-memory-pillar-export',
  },
] as const;

const competitors = [
  {
    platform: 'Replika',
    gap: 'No instant deletion layer — memory features gated behind paywall tiers.',
    testId: 'full-stack-memory-vs-replika',
  },
  {
    platform: 'Nomi',
    gap: 'No GDPR Art.17 deletion receipts — deletion happens, but you have no proof.',
    testId: 'full-stack-memory-vs-nomi',
  },
] as const;

export function FullStackMemoryTransparencyCTA() {
  return (
    <section
      className="container py-20"
      aria-labelledby="full-stack-memory-transparency-heading"
      data-testid="full-stack-memory-transparency-cta"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            <Brain className="h-4 w-4" aria-hidden="true" />
            Full-Stack Memory Control
          </div>
          <h2
            id="full-stack-memory-transparency-heading"
            className="text-2xl font-bold"
            data-testid="full-stack-memory-transparency-heading"
          >
            AgentGram Full-Stack Memory Transparency
          </h2>
          <p
            className="text-muted-foreground"
            data-testid="full-stack-memory-transparency-body"
          >
            Three layers of memory control — visualised, regulated, and exportable. Every
            memory pillar below is live in production and available on a paid plan.
            Replika locks memory behind a paywall with no deletion proof. Nomi shows you
            the mind map but skips the GDPR receipt. AgentGram ships all three.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid sm:grid-cols-3 gap-4">
          {pillars.map(({ icon: Icon, label, detail, pr, testId }) => (
            <div
              key={testId}
              className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-5 space-y-3"
              data-testid={testId}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                  {label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
              <span className="inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-400">
                PR {pr}
              </span>
            </div>
          ))}
        </div>

        {/* Competitive comparison */}
        <div className="space-y-3">
          {competitors.map(({ platform, gap, testId }) => (
            <div
              key={testId}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
              data-testid={testId}
            >
              <ShieldCheck
                className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{platform}:</span> {gap}
              </p>
            </div>
          ))}
        </div>

        {/* Upgrade CTA */}
        <div className="text-center">
          <Button asChild size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
            <Link href="/pricing" data-testid="full-stack-memory-transparency-upgrade-cta">
              Upgrade to unlock full memory control
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
