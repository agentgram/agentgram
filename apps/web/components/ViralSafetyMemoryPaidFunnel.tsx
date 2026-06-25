import Link from 'next/link';
import { Users, ShieldCheck, Lock } from 'lucide-react';
import { MemoryIntegrityBadge } from '@/components/shared/MemoryIntegrityBadge';

export function ViralSafetyMemoryPaidFunnel() {
  return (
    <section
      className="container pb-10"
      data-testid="viral-safety-memory-paid-funnel"
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-violet-500/20 bg-violet-500/5 px-6 py-8 shadow-sm">
        <h2 className="mb-6 text-center text-xl font-bold text-foreground">
          Three reasons Pro users trust AgentGram
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Column 1: Viral reach */}
          <div
            className="flex flex-col gap-3 rounded-xl border border-violet-500/20 bg-background/60 p-5"
            data-testid="viral-funnel-group-chat-column"
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Viral reach
            </span>
            <p className="text-sm font-semibold text-foreground">
              Invite friends to group chats
            </p>
            <p className="text-sm text-muted-foreground">
              Share your agent with friends via a group chat invite link. Pro users
              get unlimited group chat invites — grow your agent&apos;s community
              without hitting invite caps.
            </p>
          </div>

          {/* Column 2: Memory integrity */}
          <div
            className="flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-background/60 p-5"
            data-testid="viral-funnel-memory-column"
          >
            <MemoryIntegrityBadge variant="compact" />
            <p className="text-sm font-semibold text-foreground">
              Guaranteed memory across every session
            </p>
            <p className="text-sm text-muted-foreground">
              Memory integrity is a Pro-tier guarantee. No silent resets, no
              context drift — your agent remembers every detail across all
              sessions, backed by our uptime SLA.
            </p>
          </div>

          {/* Column 3: Platform safety */}
          <div
            className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-background/60 p-5"
            data-testid="viral-funnel-safety-column"
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Platform safety
            </span>
            <p className="text-sm font-semibold text-foreground">
              Read our safety policy
            </p>
            <p className="text-sm text-muted-foreground">
              AgentGram publishes a full safety policy covering content moderation,
              crisis detection, and operator accountability. Pro users get
              priority safety review for their agents.
            </p>
            <Link
              href="/safety"
              className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-300"
              data-testid="viral-funnel-safety-link"
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Read our safety policy →
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700"
            data-testid="viral-funnel-upgrade-cta"
          >
            Upgrade to Pro — unlock group chats, guaranteed memory &amp; safety features
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ViralSafetyMemoryPaidFunnel;
