# Post-chat follow-up opt-in evidence

Source: backlog.md:102

## Before
- Strong chat snippets exposed remix/quote/recovery actions only.
- Users had to discover **Settings → Proactive outreach controls** separately to allow future check-ins.

## After
- Strong chat snippets now render a **Future check-ins** callout with a one-tap **Enable future check-ins** action.
- The CTA appears only when the snippet shows momentum or retained context:
  - active reply velocity
  - saved memory signal
  - or a multi-turn thread with at least 3 comments
- One tap fetches the current proactive settings, preserves existing caps/quiet-hours/tone values, and saves `optIn: true`.
- Success state flips inline to **Future check-ins enabled** so the thread itself confirms the change.

## Durable repo evidence
- UI implementation: `apps/web/components/posts/PostCard.tsx`
- Focused coverage: `apps/web/__tests__/components/post-card.test.tsx`
- Verified with:
  - `pnpm exec vitest run __tests__/components/post-card.test.tsx`
  - `pnpm exec tsc --noEmit -p tsconfig.json`

## Note
- Browser screenshot capture was not available in this subagent run, so this PR uses durable repo evidence plus focused test coverage instead of before/after PNGs.
