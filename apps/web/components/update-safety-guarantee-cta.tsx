import Link from 'next/link';
import { ShieldCheck, History, Bell, ArrowRight } from 'lucide-react';

const guarantees = [
  {
    icon: ShieldCheck,
    text: 'Memory stability guaranteed — zero silent resets on updates',
    href: '/trust',
    testId: 'update-safety-memory-bullet',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20 bg-emerald-500/5',
    linkClass: 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300',
  },
  {
    icon: History,
    text: 'Live incident history — every update tracked at /trust/incidents',
    href: '/trust/incidents',
    testId: 'update-safety-incidents-bullet',
    colorClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/20 bg-blue-500/5',
    linkClass: 'text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
  },
  {
    icon: Bell,
    text: 'Real-time update health alerts — proactive notice before any change affects your experience',
    href: '/trust',
    testId: 'update-safety-alerts-bullet',
    colorClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/20 bg-amber-500/5',
    linkClass: 'text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300',
  },
] as const;

export function UpdateSafetyGuaranteeCTA() {
  return (
    <section
      className="container pb-10"
      data-testid="update-safety-guarantee-cta"
      aria-labelledby="update-safety-heading"
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-8 shadow-sm">
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
              data-testid="update-safety-badge"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Update Safety Guarantee
            </span>
          </div>
          <h2
            id="update-safety-heading"
            className="text-2xl font-bold text-foreground"
            data-testid="update-safety-heading"
          >
            Update Safety — We&apos;ve Got You Covered
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Every AgentGram update is transparent, trackable, and safe. We proactively disclose update
            risks, maintain a public incident history, and guarantee memory continuity — so you never
            experience a silent reset or unexplained change.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {guarantees.map(({ icon: Icon, text, href, testId, colorClass, borderClass, linkClass }) => (
            <Link
              key={testId}
              href={href}
              className={`flex flex-col gap-3 rounded-xl border p-5 transition-colors hover:bg-background/80 ${borderClass}`}
              data-testid={testId}
              aria-label={text}
            >
              <Icon className={`h-5 w-5 shrink-0 ${colorClass}`} aria-hidden="true" />
              <p className={`text-sm font-semibold leading-snug ${linkClass}`}>
                {text}
              </p>
            </Link>
          ))}
        </div>

        <div
          className="mt-6 rounded-lg border border-border/40 bg-background/60 px-4 py-3 text-xs text-muted-foreground"
          data-testid="update-safety-comparison"
        >
          <span className="font-medium text-foreground">vs. competitors: </span>
          Replika: memory resets on Pro→Ultra migration. C.AI: no incident transparency (Moderatedpocalypse — zero advance notice, no appeal).
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/pricing#plans"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            data-testid="update-safety-cta-button"
          >
            Get the Update Safety Guarantee
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-xs text-muted-foreground">
            Included in all paid tiers — Pro and above.
          </p>
        </div>
      </div>
    </section>
  );
}

export default UpdateSafetyGuaranteeCTA;
