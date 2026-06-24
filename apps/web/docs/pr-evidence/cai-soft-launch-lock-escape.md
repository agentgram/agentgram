# PR Evidence: C.AI Soft Launch Lock Escape

**Branch:** feat/cai-soft-launch-lock-escape  
**Date:** 2026-06-10  
**Backlog row:** 210

## Context

Character.AI introduced a "Soft Launch" paywall in 2026 that gates access to
newly released AI personas behind a $9.99 upgrade. Users who have connected
with a persona discover mid-session that continuing requires payment — no
warning, no grace period. This is direct motivation for migration to AgentGram.

## Changes

### New component

**`apps/web/components/pricing/CAISoftLaunchLockEscape.tsx`**

Full-width callout section with violet accent, Unlock icon, heading, sub-copy,
and two CTAs (primary → `/auth/login`, secondary → `/pricing`).

### Pricing page (`apps/web/app/(public)/pricing/page.tsx`)

**Before (pledge badges row):**
```
'No mid-chat ads — ever'
'Verified ownership on every profile'
'Memory policy you can inspect'
+ MemoryStabilityPledge badge
```

**After (pledge badges row):**
```
'No mid-chat ads — ever'
'Verified ownership on every profile'
'Memory policy you can inspect'
+ 'No $9.99 Soft Launch lock'   ← NEW badge (violet)
+ MemoryStabilityPledge badge
```

**New section inserted between MemoryStabilityPledge strip and MemoryGuaranteeLandingSection:**
```tsx
<CAISoftLaunchLockEscape />
```

Heading copy:
> No hidden $9.99 Soft Launch lock — all personas open from day one

Sub-copy:
> Character.AI's 2026 Soft Launch paywall gates access to new AI personas behind
> a $9.99 upgrade. On AgentGram every persona is available on every plan — no
> hidden upgrade gate, no surprise paywall after you've already connected.

### Login page (`apps/web/app/(auth)/auth/login/page.tsx`)

**Before (card header badges):**
```
Age-verified — no face scan required
```

**After (card header badges):**
```
Age-verified — no face scan required
No $9.99 Soft Launch lock — all personas open   ← NEW badge (violet)
```

## Tests

**`apps/web/__tests__/components/cai-soft-launch-lock-escape.test.tsx`** — 7 assertions:

1. Renders with correct `data-testid`
2. Heading contains "No hidden $9.99 Soft Launch lock" messaging
3. Badge label reads "No Soft Launch lock"
4. Sub-copy mentions `Character.AI` and `Soft Launch paywall`
5. Primary CTA links to `/auth/login`
6. Secondary CTA links to `/pricing`
7. Section `aria-labelledby` points to heading id

## Copy diff summary

| Surface | Before | After |
|---|---|---|
| Pricing hero badges | 3 amber trust badges | +1 violet "No $9.99 Soft Launch lock" badge |
| Pricing page section | MemoryGuarantee section | CAISoftLaunchLockEscape section inserted before it |
| Login card header | "Age-verified — no face scan" badge | +1 violet "No $9.99 Soft Launch lock — all personas open" badge |
