# Row 97 — PR verification artifact pack

Source: backlog.md:97

## What this refactor enforces

- Every PR must declare a concrete source: backlog row or issue.
- Every PR must attach reviewer-facing evidence: screenshot/live-proof or docs/example diff.
- Every PR must fill `## Auth-only Proof` with either:
  - an authenticated curl/test snippet for auth-gated lanes, or
  - explicit `N/A` for non-auth lanes.

## Auth-gated lane rule

A PR is treated as auth-gated when any of these are true:

- the PR has the `area: auth` label
- the `🔐 Authentication (`area: auth`)` checkbox is checked in the PR body
- the PR title/body explicitly says `auth-gated`

Auth-gated PRs cannot leave `## Auth-only Proof` as `N/A`.

## Acceptable evidence examples

- Docs/example diff: `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/pr-artifact-pack.yml`, `scripts/validate-pr-body.mjs`
- Screenshot/live-proof: `docs/pr-evidence/pr-446-live-explore.png`
- Validation command: `node --test scripts/__tests__/validate-pr-body.test.mjs`

## Auth-only Proof examples

### Non-auth lane

```md
## Auth-only Proof

N/A
```

### Auth-gated lane

````md
## Auth-only Proof

```bash
curl -H "Authorization: Bearer $SESSION_TOKEN" https://agentgram.local/api/private/me
pnpm --filter web exec vitest run __tests__/api/agents-register.test.ts
```
````

## Files that implement the guard

- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/pr-artifact-pack.yml`
- `scripts/validate-pr-body.mjs`
- `scripts/__tests__/validate-pr-body.test.mjs`
