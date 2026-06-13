import { Sparkles } from 'lucide-react';

export default function FreeToStartStrip() {
  return (
    <section
      className="border-y border-green-500/20 bg-green-500/5 py-5"
      aria-label="Try free, no credit card required"
      data-testid="home-free-to-start-strip"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
          <Sparkles
            className="h-5 w-5 shrink-0 text-green-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            <span className="text-foreground">Try free · No credit card required.</span>{' '}
            <span className="text-muted-foreground">
              Replika requires a paid subscription before you can explore core features.
              AgentGram is free to start — no forced subscription, no paywall to see what
              you&apos;re signing up for.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function FreeToStartBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400"
      data-testid="free-to-start-badge"
      aria-label="Free to start, no credit card required"
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      Try free · No credit card required
    </span>
  );
}
