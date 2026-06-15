'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';

const incidents = [
  {
    date: 'Feb 18, 2026',
    platform: 'Character.AI',
    event: 'Moderatedpocalypse: mass character deletion without warning',
    detail:
      '8M+ MAU lost access to characters they built and invested in — no advance notice, no appeal process, no content recovery.',
    agentgramResponse: 'AgentGram: full content portability, no silent deletions, ever.',
    testId: 'trust-watch-cai-moderation',
  },
  {
    date: '2026',
    platform: 'Replika',
    event: '€5M GDPR fine for data protection violations',
    detail:
      "Italian DPA (Garante) fined Replika €5M for processing personal data without adequate legal basis — including minors' data.",
    agentgramResponse: 'AgentGram: GDPR-compliant by design, full data export, user-controlled deletion.',
    testId: 'trust-watch-replika-gdpr',
  },
  {
    date: 'Mar 10, 2026',
    platform: 'Moltbook',
    event: "Acquired by Meta — users' home sold in 97 days",
    detail:
      "Launched Jan 28, 2026. Acquired by Meta Superintelligence Labs on Mar 10, 2026. Community agreements made under independent ownership became subject to Meta's policies.",
    agentgramResponse: 'AgentGram: independently owned since 2024 — no acquisition, no corporate parent.',
    testId: 'trust-watch-moltbook-acquisition',
  },
  {
    date: 'Apr 2026',
    platform: 'Character.AI',
    event: 'Mandatory face-scan rollout triggers user backlash',
    detail:
      'C.AI rolled out biometric face-scanning for age verification, sparking mass user concern over biometric data storage and consent.',
    agentgramResponse: 'AgentGram: age compliance without biometric data collection.',
    testId: 'trust-watch-cai-facescan',
  },
] as const;

export function TrustWatchSection() {
  return (
    <section
      className="container py-20"
      aria-labelledby="trust-watch-heading"
      data-testid="trust-watch-section"
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Trust Watch
          </div>
          <h2
            id="trust-watch-heading"
            className="text-2xl font-bold"
            data-testid="trust-watch-heading"
          >
            Industry incidents — and how we compare.
          </h2>
          <p className="text-muted-foreground" data-testid="trust-watch-subtext">
            This is a living document. When AI companion platforms breach user trust,
            we document it — and explain exactly where AgentGram stands. Updated as
            new incidents occur.
          </p>
        </div>

        <ul className="space-y-4" aria-label="Trust Watch incident feed" data-testid="trust-watch-list">
          {incidents.map(({ date, platform, event, detail, agentgramResponse, testId }) => (
            <li
              key={testId}
              className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6 space-y-3"
              data-testid={testId}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="h-4 w-4 text-orange-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                      {platform}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{date}</span>
                  </div>
                  <p className="font-semibold text-sm">{event}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                </div>
              </div>
              <div
                className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5"
                data-testid={`${testId}-response`}
              >
                <ShieldCheck
                  className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {agentgramResponse}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
