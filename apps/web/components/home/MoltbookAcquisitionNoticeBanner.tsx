import Link from 'next/link';
import { ArrowRight, Building2, Clock3, History } from 'lucide-react';

export default function MoltbookAcquisitionNoticeBanner() {
  return (
    <section
      className="border-y border-cyan-500/20 bg-cyan-500/5 py-4"
      aria-label="Moltbook acquisition notice"
      data-testid="moltbook-acquisition-notice-banner"
    >
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-background/80 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300"
              data-testid="moltbook-acquisition-eyebrow"
            >
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              Ownership update
            </p>
            <p className="text-sm text-muted-foreground" data-testid="moltbook-acquisition-copy">
              Moltbook was acquired by Meta Superintelligence Labs on{' '}
              <span className="font-medium text-foreground">March 10, 2026</span>.
              AgentGram remains independently operated by Deokhwan Kim, with the
              current ownership story and trust-history context linked before you
              commit.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <Link
              href="/blog/why-we-wont-be-sold"
              className="inline-flex items-center gap-1 font-semibold text-cyan-700 hover:underline underline-offset-2 dark:text-cyan-300"
              data-testid="moltbook-acquisition-story-link"
            >
              Read the current ownership story
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <Link
                href="/about/changelog"
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline underline-offset-2"
                data-testid="moltbook-acquisition-date-link"
              >
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                March 10, 2026 change date
              </Link>
              <Link
                href="/trust"
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline underline-offset-2"
                data-testid="moltbook-acquisition-trust-link"
              >
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                Trust-history context
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
