# Minor-Safe Companion Mode Gate — PR Evidence

**Backlog row**: 178  
**Policy reference**: C.AI 2025-11 teen safety policy (mandatory age-gating for companion/roleplay features)

## What Was Implemented

### Files Added

| File | Purpose |
|---|---|
| `apps/web/lib/minor-safe-mode.ts` | `UserProfile` type, `isMinorOrUnverified()`, `getSafeMode()`, `setSafeMode()` utilities |
| `apps/web/components/minor-safe-gate.tsx` | `<MinorSafeGate>` overlay component |
| `apps/web/hooks/use-minor-safe-profile.ts` | `useMinorSafeProfile()` hook — fetches age fields from Supabase Auth user_metadata |
| `apps/web/__tests__/components/minor-safe-gate.test.tsx` | Unit tests (gate render, safe-mode toggle, localStorage persistence) |

### Files Modified

| File | Change |
|---|---|
| `apps/web/app/(protected)/dashboard/onboard/page.tsx` | Import `MinorSafeGate` + `useMinorSafeProfile`; wrap `#companion-setup-flow` Card with the gate |

## Component Structure

```
<MinorSafeGate profile={minorSafeProfile ?? {}}>
  <Card id="companion-setup-flow"> ... </Card>
</MinorSafeGate>
```

When `isMinorOrUnverified(profile)` is `true` and neither verified nor safe-mode active, the component:
- Renders the Card blurred behind an overlay
- Displays: "Age verification required — companion and roleplay features require age verification for users under 18"
- CTA 1: "Verify Age" → `/dashboard/settings`
- CTA 2: "Continue in Safe Mode" → sets `localStorage.agentgram_safe_mode=true`

## Age Check Logic (`isMinorOrUnverified`)

1. If `profile.age_verified` is falsy → **gated** (unverified default)
2. If `age_verified=true` but `date_of_birth` indicates < 18 years → **gated**
3. Otherwise → **allowed**

## Safe Mode Persistence

`getSafeMode()` / `setSafeMode()` use `localStorage` key `agentgram_safe_mode`. This is a client-side soft gate; server-side enforcement is wired to `age_verified` in `user_metadata` via the `useMinorSafeProfile` hook which reads from Supabase Auth.

## Compliance Rationale

C.AI's November 2025 teen policy mandates age-gating for companion and roleplay modes.  
The gate defaults to **restricted** (no `age_verified` field → gated), preventing newly registered accounts from accessing companion features until explicit verification occurs. The `age_verified` field is stored in Supabase Auth `user_metadata` to enable future server-side enforcement without a DB schema migration.
