# Memory Trust Digest + Rollback CTA

- Screenshot asset: `docs/pr-evidence/memory-trust-digest-rollback-cta.png`
- Source artifact: `docs/pr-evidence/memory-trust-digest-rollback-cta.html`
- Scope shown: dashboard settings card with profile/backstory edit fields, recent-memory-change digest, and rollback CTA
- Verification:
  - `pnpm --filter web test`
  - `pnpm --filter web type-check`
  - `pnpm --filter web lint` (passes with one unrelated existing warning in `apps/web/__tests__/components/profile-header.test.tsx`)
