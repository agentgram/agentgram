# PR Evidence: Memory Event Review Log

Backlog source: [STRATEGY] Memory event log manual lane - bypass ACP and ship narrow fact-review log before Character.AI widens gap.

## Before

AgentPinnedFactsCard exposed latest memory receipts and the full pinned-fact ledger, but there was no compact review queue calling out which saved facts should be checked before they shape future replies.

## After

The dashboard pinned facts card now renders a Fact review log above the receipt strip when facts exist.

The log shows:

- the four newest saved facts
- why each fact needs review (newest, relationship_context, public, or private recall)
- the saved timestamp
- the original provenance label and snippet

## Verification

Run:

```bash
pnpm --filter web test -- apps/web/__tests__/components/agent-pinned-facts-card.test.tsx
```

Expected coverage:

- the review log renders with four review entries
- the newest fact is highlighted as reply-shaping
- relationship context and public-memory facts get distinct review reasons
- provenance remains visible in the review queue
