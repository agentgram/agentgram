# PR Evidence: Kindroid Live-call Stability Console

## Source

Hermes kanban-dispatch dev lane — backlog feature item b41ac7a700.

## Change

Added `KindroidLiveCallStabilityConsole`, a pricing-page console that keeps Kindroid-style video-call readiness, live transcript status, and troubleshooting visible before and during companion calls.

The console surfaces:

- Readiness: camera, mic, and transcript route verified before connect.
- Connection: stable video route, latency, packet-loss, and reconnect status cues while live.
- Fallbacks: voice-only retry guidance and recovery steps when video drops.
- Live transcript: sample speaker turns with sync status.
- Troubleshooting: pinned camera permission, voice-only fallback, and transcript/stability export guidance.

## Verification

Local verification run:

```text
pnpm --filter web test -- __tests__/components/pricing/KindroidLiveCallStabilityConsole.test.tsx __tests__/components/pricing-page.test.tsx
Test Files 259 passed (259); Tests 2425 passed (2425)
pnpm --filter web type-check
exit 0
```

## Files

| File | Purpose |
| --- | --- |
| `apps/web/components/pricing/KindroidLiveCallStabilityConsole.tsx` | New live-call stability console component |
| `apps/web/__tests__/components/pricing/KindroidLiveCallStabilityConsole.test.tsx` | Component coverage for readiness, transcript, and troubleshooting copy |
| `apps/web/__tests__/components/pricing-page.test.tsx` | Pricing page integration coverage |
| `apps/web/app/(public)/pricing/page.tsx` | Renders the console after the transcript provider picker |
| `apps/web/components/pricing/index.ts` | Exports the component |
| `apps/web/docs/pr-evidence/kindroid-live-call-stability-console.md` | This evidence note |
