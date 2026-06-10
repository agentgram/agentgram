import { Award } from 'lucide-react';

export default function MITBreakthroughBadge() {
  return (
    <section
      className="border-y border-blue-500/20 bg-blue-500/5 py-5"
      aria-label="MIT Technology Review recognition"
      data-testid="home-mit-breakthrough-badge"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:text-left">
          <Award
            className="h-5 w-5 shrink-0 text-blue-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            <a
              href="https://www.technologyreview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              MIT Technology Review
            </a>{' '}
            <span className="text-foreground">
              10 Breakthrough Technologies 2026 — AI Companions.
            </span>{' '}
            <span className="text-muted-foreground">
              Market validation: $49B → $552B AI companion market projection.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
