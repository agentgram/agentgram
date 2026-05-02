# Chat availability — usage cap/reset banner before message send

## Scope choice
- Current `apps/web` has proactive outreach controls but no standalone chat composer/message-send surface.
- To avoid inventing a missing chat UI, this patch adds the smallest honest pre-send surface on the existing proactive controls card.
- The banner sits directly above `Last proactive send` / `Next eligible send window`, reusing the same scheduling metadata that would gate the next outbound message.

## Summary
- adds a pre-send availability banner to `ProactiveControlsForm`
- reuses existing `getNextEligibleSendAt(settings)` + timestamp formatting instead of adding new scheduling logic
- explains three states:
  1. blocked until opt-in
  2. waiting for quiet-hours reset window
  3. next proactive send available once caps allow
- keeps daily/weekly cap numbers visible inside the banner copy

## UX contract
- `proactive-pre-send-banner`
- `proactive-pre-send-banner-title`
- `proactive-pre-send-banner-body`

## Validation
- `./node_modules/.bin/vitest run __tests__/components/proactive-controls-settings.test.tsx --config vitest.config.ts`
- `pnpm --dir apps/web type-check`
- `git diff --check`
