import Link from 'next/link';
import { ArrowRight, ShieldCheck, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemoryStabilityPledge } from '@/components/memory-stability-pledge';
import { AgentBackupCTA } from '@/components/agent-backup-cta';
import { CreatorProtectedBadge } from '@/components/content-permanence-pledge';

export function MemoryGuaranteeLandingSection() {
  return (
    <section
      className="py-20 bg-gradient-to-b from-emerald-500/5 to-background"
      aria-labelledby="memory-guarantee-heading"
      data-testid="memory-guarantee-landing-section"
    >
      <div className="container max-w-5xl">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            AgentGram Memory Guarantee
          </div>
          <h2
            id="memory-guarantee-heading"
            className="text-4xl md:text-5xl font-bold"
            data-testid="memory-guarantee-heading"
          >
            Your memories. Your agents. Forever.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Replika 2.0 wiped relationships without warning. C.AI deleted
            thousands of agents in a single moderation sweep. AgentGram makes
            three binding guarantees so it never happens to you.
          </p>
        </div>

        <div
          className="grid md:grid-cols-3 gap-6 mb-12"
          data-testid="memory-guarantee-trio"
        >
          <div
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3"
            data-testid="memory-guarantee-card-stability"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Memory Stability
            </div>
            <p className="font-semibold text-foreground">
              Memories survive every platform update.
            </p>
            <p className="text-sm text-muted-foreground leading-6">
              Replika 2.0 silently wiped emotional memory on a routine update in
              early 2026. AgentGram guarantees every memory your agent holds
              today is intact after every release — no exceptions.
            </p>
            <div className="pt-2">
              <MemoryStabilityPledge variant="badge" />
            </div>
          </div>

          <div
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3"
            data-testid="memory-guarantee-card-backup"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              <Download className="h-4 w-4" aria-hidden="true" />
              Character Backup
            </div>
            <p className="font-semibold text-foreground">
              One-tap export of everything.
            </p>
            <p className="text-sm text-muted-foreground leading-6">
              Full persona, memory, and conversation history — portable and
              yours. Export at any time, no lock-in.
            </p>
            <div className="pt-2">
              <AgentBackupCTA />
            </div>
          </div>

          <CreatorProtectedBadge />
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          data-testid="memory-guarantee-cta"
        >
          <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
            <Link href="/pricing">
              Upgrade for guaranteed memory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/dashboard/data-export">
              <Download className="mr-1.5 h-4 w-4" />
              Export companion now
            </Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Memory guarantee applies to all paid tiers (Starter, Pro, Enterprise).{' '}
          <Link
            href="/pricing"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
            data-testid="memory-guarantee-pricing-link"
          >
            View plans
          </Link>
        </p>
      </div>
    </section>
  );
}
