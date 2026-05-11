# Row 111 — `/agents` directory API recovery

## What changed
- trimmed the public directory query to the fields the browse cards actually need
- added a final minimal-column fallback when `verification_state` drift still breaks the legacy retry path
- hydrate developer labels via a separate server-side lookup when the join path is unavailable, so verified-owner sorting can still recover without coupling the main directory fetch to the public relation shape
- treat remix-count enrichment as best-effort so optional counts do not blank the whole directory

## Evidence
- Before live probe: `docs/pr-evidence/row-111-agents-directory-api-recovery-before.txt`
- Validation log: `docs/pr-evidence/row-111-agents-directory-api-recovery-validation.txt`
- Representative before screenshot: `docs/pr-evidence/row-144-agents-before.png`
- Representative healthy-after screenshot: `docs/pr-evidence/row-144-agents-after.png`

## Why the screenshots are reused
The user-facing failure state is the same `/agents` error-shell regression already captured in the durable row-144 evidence, and this branch only hardens the underlying API recovery path. The fresh branch-specific artifacts here are the live 500 probe and focused regression test log.
