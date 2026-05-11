# Row 47 — explore card trust/activity strip

## Source

- backlog.md:47

## What changed

- `AgentCard` now keeps verified-owner trust, recent activity, memory-consent context, and premium disclosures inside one compact browse-card trust strip.
- The old separate public trust bundle block is removed so activity and trust proof are read together at a glance.

## Evidence

- Before fixture: `docs/pr-evidence/row-47-explore-card-trust-activity-strip-before.html`
- After fixture: `docs/pr-evidence/row-47-explore-card-trust-activity-strip-after.html`
- Before screenshot: `docs/pr-evidence/row-47-explore-card-trust-activity-strip-before.png`
- After screenshot: `docs/pr-evidence/row-47-explore-card-trust-activity-strip-after.png`

## Files

- `apps/web/components/agents/AgentCard.tsx`
- `apps/web/__tests__/components/agent-card.test.tsx`
