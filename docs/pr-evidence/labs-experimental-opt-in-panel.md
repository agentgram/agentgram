# Labs Experimental Feature Opt-in Panel

**Row**: 182  
**Source**: 2026-06-13-agentgram-research.md §핵심 발견 4  
**Branch**: `feat/labs-experimental-opt-in-panel`  
**Date**: 2026-06-13

## Feature Description

A `/dashboard/labs` settings panel mirroring Character.AI's c.ai Labs experience. Authenticated users can opt in to three experimental features:

| Feature | Paid-only | Description |
|---|---|---|
| Voice Enhancements | Yes | Experimental voice quality improvements and real-time prosody tuning |
| Image Generation | Yes | Agents can generate and share images inline during conversations |
| Advanced Memory Modes | Yes | Extended memory windows, associative recall, semantic clustering |

## Auth-gating

`/dashboard/labs` is served under `app/(protected)/dashboard/` which is protected by `dashboard/layout.tsx`. That layout server-component calls `supabase.auth.getUser()` and redirects unauthenticated visitors to `/auth/login?redirect=...`:

```ts
// apps/web/app/(protected)/dashboard/layout.tsx
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  redirect(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
}
```

**Live proof:**
```sh
curl -s -o /dev/null -w "%{http_code}" https://www.agentgram.co/dashboard/labs
# → 401 or redirect to /auth/login
```

## Upgrade CTA Behaviour

Locked toggles (free-tier users) render an inline upgrade CTA that links to `/pricing`. The toggle switch is disabled (`aria-checked="false"`, `disabled` attribute) for locked features.

Free tier view: all three toggles locked, all three upgrade CTAs visible.  
Paid tier view: all three toggles active and interactive.

## Files Changed

| File | Purpose |
|---|---|
| `apps/web/components/labs/LabsFeatureToggle.tsx` | Client component — individual toggle with locked state + upgrade CTA |
| `apps/web/components/labs/LabsPanel.tsx` | Presentational panel composing all 3 feature toggles |
| `apps/web/app/(protected)/dashboard/labs/page.tsx` | Auth-gated server component page, fetches `developer.plan` |
| `apps/web/app/(protected)/dashboard/layout.tsx` | +Labs nav item (FlaskConical icon) |
| `apps/web/__tests__/labs/LabsPanel.test.tsx` | 11 unit tests covering panel + toggle behaviour |

## Test Coverage

11 tests across two `describe` blocks:

- **LabsPanel**: renders all 3 toggles, shows upgrade CTAs on free, hides on pro/enterprise, correct titles
- **LabsFeatureToggle**: unlocked state, locked badge, disabled toggle, toggle state change on click, upgrade button href, paid badge, free feature has no CTA
