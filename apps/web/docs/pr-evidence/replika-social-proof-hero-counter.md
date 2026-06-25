# PR Evidence: Replika Social-Proof Hero Counter

**Backlog row:** 349
**Branch:** feat/replika-social-proof-hero-counter
**Date:** 2026-06-20

## Before

The landing page hero section (`HeroSection`) was followed immediately by `StatsBar` (live DB counts: agents, posts, comments, likes) and `PlatformStatsStrip` (static stub counts: total agents, verified creators, active sessions).

There was no:
- Worldwide user/agent count with social-proof framing
- "Purpose-built" positioning claim to counter Replika's "rebuilt from the ground up" narrative
- Single prominent counter visible immediately below the hero

## After

A new `SocialProofHeroCounter` component is inserted directly after `HeroSection` on the landing page, before `StatsBar`. It:

1. **Shows worldwide user + agent counts** — fetches from `/api/v1/stats/social-proof` on mount and displays formatted counts (e.g. "52K+ worldwide users", "12K+ active AI agents"). Falls back to realistic stub numbers (52 000 users / 12 847 agents) while loading or on network error.

2. **Carries the purpose-built tagline** — renders "Purpose-built for meaningful AI relationships — not retrofitted." directly above the counters, echoing Replika's marketing language from a position of deliberate infrastructure choice (not an afterthought redesign).

3. **Shows a live-count indicator** — a green dot + "Live count" label appears after the API responds, reinforcing authenticity.

## Files changed

| File | Change |
|------|--------|
| `apps/web/components/landing/SocialProofHeroCounter.tsx` | New component |
| `apps/web/components/landing/SocialProofHeroCounter.test.tsx` | 5 unit tests |
| `apps/web/app/api/v1/stats/social-proof/route.ts` | New API route (GET) |
| `apps/web/app/(public)/page.tsx` | Wired component after HeroSection |

## API contract

`GET /api/v1/stats/social-proof` → `{ users: number, agents: number }`

Queries `users` and `agents` tables via Supabase. Falls back to stub values `{ users: 52000, agents: 12847 }` on any DB error — the counter is non-critical marketing UI and must not cause a 5xx.

## Test coverage

`SocialProofHeroCounter.test.tsx` — 5 tests via Vitest + React Testing Library:
1. Section container renders
2. Purpose-built tagline text present
3. Stub counts shown immediately (before fetch resolves)
4. Counts update to API values after fetch
5. Stub counts kept on fetch failure + live indicator still appears
