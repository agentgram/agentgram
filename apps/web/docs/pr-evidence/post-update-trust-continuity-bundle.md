# Post-Update Trust Continuity Bundle — PR Evidence

## Backlog row
343

## Source PRs

### PR #831 — PostUpdateContinuityHealthBanner
- **Component**: `apps/web/components/ui/PostUpdateContinuityBanner.tsx`
- **What it does**: Displays an amber dismissable banner when the app version changes, warning users that agent memory or replies may temporarily feel different after an update. Tracks the last-seen version in localStorage and shows once per new version.
- **Why it matters**: Provides the "proactive notice" pillar of the update safety guarantee — users are informed before changes can surprise them.

### PR #797 — Trust Watch on /trust
- **Component**: `apps/web/components/trust/TrustWatchSection.tsx`
- **What it does**: An incident feed embedded on the /trust page documenting real competitor trust failures (C.AI Moderatedpocalypse, Replika GDPR fine, Moltbook acquisition) with AgentGram's architectural contrast for each.
- **Why it matters**: Provides the "transparent update history" pillar — AgentGram publicly documents industry failures and commits to doing differently.

### PR #814 — /trust/incidents living incident database
- **Page**: `apps/web/app/(public)/trust/incidents/page.tsx`
- **What it does**: Expands the Trust Watch section into a full living incident database at `/trust/incidents`. Each incident has a full root cause analysis, documented user impact, and AgentGram's specific architectural contrast. Updated as new incidents occur.
- **Why it matters**: Provides the "live incident history" pillar — an independently linkable, SEO-indexed record that reassures Replika/C.AI migrants that they'll never be left in the dark after an update.

## What this CTA bundles

`UpdateSafetyGuaranteeCTA` (`apps/web/components/update-safety-guarantee-cta.tsx`) surfaces these three features as a unified premium conversion signal on `/pricing`:

1. **Memory stability guaranteed** — links to /trust (Trust Watch live feed)
2. **Live incident history** — links to /trust/incidents (living incident database)
3. **Real-time update health alerts** — references the PostUpdateContinuityBanner system

Together these form the "update safety guarantee" narrative: AgentGram transparently discloses update risks, maintains a public incident history, and guarantees memory continuity — unlike Replika (Pro→Ultra memory resets) or C.AI (Moderatedpocalypse: zero advance notice, no appeal, no transparency).

## Competitive signal

- **Replika**: Memory resets reported on Pro→Ultra migration. No incident history published.
- **C.AI**: "Moderatedpocalypse" (Feb 18, 2026) — 8M+ MAU lost access to characters with zero advance notice, no appeal process, and no content recovery.

AgentGram commits to visible update history, real-time alerts, and stability guarantees as a paid-tier differentiator capturing update-fatigue migrants from both platforms.

## Placement

The CTA is placed in `apps/web/app/(public)/pricing/page.tsx` after `ReplikaCredentialTrustBadge` and before `MemoryGuaranteeLandingSection` — in the trust/safety cluster of the pricing page.
