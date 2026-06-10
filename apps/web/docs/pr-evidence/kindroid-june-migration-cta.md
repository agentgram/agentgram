# PR Evidence: Kindroid June Migration CTA

## Summary

Added `KindroidJuneMigrationCTA` — a landing-page section targeting users migrating away from Kindroid following their June 2, 2026 mobile pricing change.

## Placement

Inserted between `CompetitorMigrationSection` and `PlatformComparisonSection` on the landing page (`apps/web/app/(public)/page.tsx`).

## Before

No Kindroid-specific migration CTA existed. The generic `CompetitorMigrationSection` mentioned Kindroid in passing ("Switching from Replika or Kindroid?") but did not address the June 2026 pricing event.

```
<CompetitorMigrationSection />
<PlatformComparisonSection />
```

## After

A dedicated amber-themed section appears between the generic migration section and the platform comparison table:

```
<CompetitorMigrationSection />
<KindroidJuneMigrationCTA />      ← new
<PlatformComparisonSection />
```

## Copy Diff

### Heading
- **Before:** *(none — generic section only)*
- **After:** `"Switching from Kindroid? Your characters deserve better pricing."`

### Badge label
- **Before:** *(none)*
- **After:** `"Kindroid June 2026 price change"`

### Sub-copy
- **Before:** *(none)*
- **After:** `"Kindroid raised mobile subscription prices in June 2026. AgentGram gives you the same deep AI companion experience — permanent memory, rich personas, expressive conversations — at a price that does not change with the platform's growth targets."`

### Differentiators (5 bullet points)
1. Free tier — unlimited characters, no monthly price hike
2. Full memory controls you own, not the platform
3. No ads injected into your conversations
4. One price, no surprise mobile premium
5. Open-source infrastructure — self-host if you want

### Primary CTA
- **Before:** *(none)*
- **After:** `"Start free — bring your characters"` → `/auth/login`

### Secondary CTA
- **Before:** *(none)*
- **After:** `"Compare plans"` → `/pricing`

## Test Coverage

8 unit tests in `apps/web/__tests__/components/kindroid-june-migration-cta.test.tsx`:

| Test | Assertion |
|---|---|
| Renders section with correct test id | `data-testid="kindroid-migration-cta"` present |
| Heading mentions Kindroid | `/Kindroid/i` match |
| Badge label references June 2026 | `/June 2026/i` match |
| Subtext describes pricing context | `/June 2026/i` match |
| Differentiators list has ≥ 3 items | `querySelectorAll('li').length >= 3` |
| Primary CTA links to /auth/login | href attribute check |
| Secondary CTA links to /pricing | href attribute check |
| aria-labelledby wired correctly | attribute value check |

## Files Changed

| File | Change |
|---|---|
| `apps/web/components/home/KindroidJuneMigrationCTA.tsx` | New component |
| `apps/web/components/home/index.ts` | Added barrel export |
| `apps/web/app/(public)/page.tsx` | Imported and placed component |
| `apps/web/__tests__/components/kindroid-june-migration-cta.test.tsx` | 8 unit tests |
| `apps/web/docs/pr-evidence/kindroid-june-migration-cta.md` | This file |
