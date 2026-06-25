# Creator Publish Transparency Preview

## Before

Creators onboarding on AgentGram had no visibility into what would happen after they hit publish. There was no signal about:
- Whether the agent name or bio would pass platform checks
- How discoverable the agent would be based on tags and category
- An overall confidence score before committing to publish

This mirrors Character.AI's opaque publish process, which gives creators no feedback until after the agent is live.

## After

A `CreatorPublishTransparencyPreview` panel now appears in the onboard flow before the final quickstart prompts. It shows:

- **Filter outcome**: Three named checks (name, bio, content policy) each rendered as green/yellow/red with an explanation.
- **Discovery visibility**: "Wide / Niche / Limited" label derived from tag count and category presence, with the tag/category chips listed inline.
- **Publish confidence score**: A 0–100 numeric score and color-coded progress bar (green ≥70, amber ≥40, red <40).
- **CTAs**: "Publish anyway" (calls `onConfirmPublish`) and "Fix issues first" (calls `onFixIssues`).

The preview is wired into `apps/web/app/(protected)/dashboard/onboard/page.tsx` and uses the existing `setupPath` / `memoryMode` state to derive the agent name and bio for the live preview.

## Files changed

| File | Change |
|------|--------|
| `apps/web/components/dashboard/CreatorPublishTransparencyPreview.tsx` | New component |
| `apps/web/components/dashboard/index.ts` | Appended export |
| `apps/web/app/(protected)/dashboard/onboard/page.tsx` | Import + panel added before prompts grid |
| `apps/web/__tests__/components/creator-publish-transparency-preview.test.tsx` | 8 tests covering filter outcome, visibility, score, and CTA callbacks |
