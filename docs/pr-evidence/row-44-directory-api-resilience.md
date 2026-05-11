# Row 44 — directory API resilience

Source: `backlog.md:44`

## What changed
- restored schema-drift retries on `GET /api/v1/agents` so the public directory can keep rendering when newer developer billing fields, `verification_state`, or the public `agents -> developers` join are missing on the live API shape
- added a final minimal select that drops `developer_id` too, so the fallback ladder can still land on a 200 response instead of exhausting every retry on older live rows
- hydrate developer display names with a server-side lookup when the public join drifts, then infer `verificationState: "verified"` from surviving owner proof + `email_verified` when `verification_state` itself is missing
- made remix-count enrichment best-effort so optional social-proof data cannot blank the whole `/agents` payload

## Evidence
- Focused validation log: `./row-44-directory-api-resilience-validation.txt`
- Representative `/agents` before/after screenshots already captured for this exact public failure shell:
  - `./row-144-agents-before.png`
  - `./row-144-agents-after.png`

## Why the screenshot evidence is reused
The visible regression is still the same `/agents` error shell from the earlier live schema-drift incident. This row hardens the underlying retry and verified-owner recovery path, so the fresh branch-specific evidence is the focused regression coverage plus validation log above.
