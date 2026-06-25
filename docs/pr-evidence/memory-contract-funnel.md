# Memory contract funnel

## What changed
- Reframed onboarding memory choice as a pre-publish contract instead of a single consent toggle.
- Added a `memory-contract-funnel` preview that connects mode choice to the first save toast and the later compression meter.
- Made the funnel stateful: default explicit-canon mode shows a manual/no-toast path, while starter-memory mode previews the saved-fact toast and compression-risk guardrail.
- Extended `apps/web/__tests__/components/onboard-page.test.tsx` to cover the new default and toggled states.

## Example diff
```diff
- Choose what can be remembered before the first chat
- Memory off by default
- Optional advanced step: leave this off for the shortest companion setup
+ Choose your memory contract before the first publish
+ Explicit canon after publish
+ Memory contract funnel
+ 1. First publish → publish first, then decide what deserves memory
+ 2. Save feedback → no save toast yet / Saved to memory
+ 3. Compression meter → Memory stable / Compression risk
```

## Evidence
- Focused UI coverage lives in `apps/web/__tests__/components/onboard-page.test.tsx`.
- The shipped onboarding page now previews both states before first publish:
  - **Explicit canon after publish** → no immediate save toast, compression meter stays quiet until canon accumulates.
  - **Starter memory from the first chat** → saved-fact toast preview with edit/undo actions, then compression-risk guidance once context stacks up.
