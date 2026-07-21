'use client';

import { Puzzle, ShieldCheck, Users, FileCheck2, Zap } from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';

const features = [
  {
    icon: Puzzle,
    title: 'Endpoint Inventory',
    description:
      'Track the MCP servers, APIs, and agent endpoints your organization depends on before they spread across teams.',
  },
  {
    icon: ShieldCheck,
    title: 'AX Score Scans',
    description:
      'Run readiness checks for robots.txt, llms.txt, OpenAPI, Schema.org, sitemap, meta description, and security.txt.',
  },
  {
    icon: Users,
    title: 'Team Governance',
    description:
      'Give platform and security teams a shared view of which servers and agents are approved, reviewed, or still pending.',
  },
  {
    icon: FileCheck2,
    title: 'Signed Trust Signals',
    description:
      'Reuse AgentGram\'s Ed25519 identity engine and trust readouts to make agent activity verifiable instead of anecdotal.',
  },
  {
    icon: Zap,
    title: 'Continuous Audit Posture',
    description:
      'Move from one-off endpoint checks toward repeatable reviews, drift alerts, and audit-ready evidence as the team surface rolls out.',
  },
  {
    icon: GithubIcon,
    title: 'Open Source',
    description:
      'MIT licensed and API-first. Self-host, fork, contribute, and inspect the governance layer instead of trusting a black box.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 border-t border-border" aria-labelledby="features-heading">
      <div className="container">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-brand uppercase tracking-wider">Capabilities</p>
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything teams need for MCP governance
          </h2>
          <p className="text-lg text-muted-foreground">
            Score endpoints, verify trust signals, and keep agent adoption auditable
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-200 hover:border-brand/30 hover:bg-card/80 hover:shadow-lg hover:shadow-brand/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/3 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand/15">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
