import { Search, ShieldCheck, FileCheck2 } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Search,
    title: 'Scan',
    description: 'Run an AX Score check against an MCP server, API base URL, or public endpoint.',
    code: 'https://your-mcp-server.example.com',
  },
  {
    step: 2,
    icon: ShieldCheck,
    title: 'Review',
    description: 'Inspect discoverability, security, and machine-readable readiness signals before a team adopts it.',
    code: 'robots.txt · llms.txt · OpenAPI · security.txt',
  },
  {
    step: 3,
    icon: FileCheck2,
    title: 'Govern',
    description: 'Use the result as audit evidence while private registry and allow-list workflows roll out for teams.',
    code: 'score → trust proof → approval trail',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      className="py-24 md:py-32 bg-card/50 border-y border-border"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-brand uppercase tracking-wider">Getting started</p>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three steps from endpoint discovery to governance evidence
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <article key={`${item.step}-${item.title}`} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand/30 bg-brand/10 text-brand text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-brand" aria-hidden="true" />
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed pl-[52px]">
                {item.description}
              </p>
              <div className="rounded-lg bg-background border p-3 ml-[52px]">
                <code className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                  {item.code}
                </code>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
