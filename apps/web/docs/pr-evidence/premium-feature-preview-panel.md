# Premium Feature Preview Panel — PR Evidence

## Summary

Adds `/dashboard/settings/premium-preview` — a new page within the authenticated dashboard that lists all premium features in a Starter vs Pro comparison table. The goal is to make paid features tangible before the paywall, reducing checkout abandonment by letting users clearly see what they unlock when upgrading. Parity with Kindroid Ultra gate transparency.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/settings/PremiumFeaturePreviewPanel.tsx` | New component with `PremiumFeatureRow`, `PremiumFeatureCategorySection`, and `PremiumFeaturePreviewPanel` |
| `apps/web/app/(protected)/dashboard/settings/premium-preview/page.tsx` | New page at `/dashboard/settings/premium-preview` |
| `apps/web/__tests__/components/settings/PremiumFeaturePreviewPanel.test.tsx` | Unit tests (14 tests) |
| `apps/web/docs/pr-evidence/premium-feature-preview-panel.md` | This file |

## Before

- `/dashboard/settings` showed agent memory trust, proactive controls, lorebook, and diary settings.
- No surface existed to preview which features are locked behind the Pro tier before hitting a paywall.
- Users couldn't browse the full feature set without bumping into individual upgrade prompts scattered across the dashboard.

## After

`/dashboard/settings/premium-preview` shows:

```
┌──────────────────────────────────────────────────────┐
│  ← Settings                                           │
│                                                       │
│  ✦ Premium Features                                   │
│  See what's included in each plan.                    │
│                                                       │
│  Starter vs Pro comparison                            │
│  ┌──────────────────┬──────────┬────────────┐        │
│  │ Feature          │ Starter  │    Pro      │        │
│  ├──────────────────┼──────────┼────────────┤        │
│  │ Memory           │          │             │        │
│  │   Pinned facts   │ Included │  Included   │        │
│  │   Private lorebook│ 🔒 Locked│  ✓ Included│        │
│  │   Memory export  │ 🔒 Locked│  ✓ Included│        │
│  ├──────────────────┼──────────┼────────────┤        │
│  │ Voice            │          │             │        │
│  │   Voice responses│ 🔒 Locked│  ✓ Included│        │
│  │  ...             │          │             │        │
│  │ Image Generation │          │             │        │
│  │ Group Chat       │          │             │        │
│  │ Analytics        │          │             │        │
│  └──────────────────┴──────────┴────────────┘        │
│                                                       │
│  ╔═════════════════════════════════════════╗          │
│  ║  👑 Unlock everything with Pro           ║          │
│  ║  Voice, image gen, group chat...         ║          │
│  ║  [ Upgrade to Pro ]  [ Try free 7 days ] ║          │
│  ╚═════════════════════════════════════════╝          │
└──────────────────────────────────────────────────────┘
```

## Feature Categories

Five categories with 14 total features:

1. **Memory** — Pinned facts (Starter), Private lorebook (Pro), Memory transparency panel (Pro), Memory export (Pro)
2. **Voice** — Voice responses (Pro), Custom voice selection (Pro), Low-latency voice (Pro)
3. **Image Generation** — Image generation (Pro), Selfie engine (Pro)
4. **Group Chat** — Multi-agent group chat (Pro), Group memory isolation (Pro)
5. **Analytics** — AX Score (Pro), Proactive post analytics (Pro), Companion insights (Pro)

## Auth Gating

The page lives under `app/(protected)/dashboard/settings/premium-preview/page.tsx`. The `(protected)` route group uses `DashboardLayout` which checks `supabase.auth.getUser()` and redirects to `/auth/login` for unauthenticated requests (see `layout.tsx:34-37`). The page itself also performs a `redirect()` check as defense-in-depth.

## Test Coverage

See `apps/web/__tests__/components/settings/PremiumFeaturePreviewPanel.test.tsx` (14 tests):

- Renders the panel container (`data-testid="premium-feature-preview-panel"`)
- Renders Starter / Pro column headers
- Renders all five feature categories
- Shows upgrade CTA section
- Upgrade CTA links to `/pricing`
- Trial CTA is present and links to `/pricing`
- Trial CTA contains "7 days" copy
- "Upgrade to Pro" text present in CTA button
- `PremiumFeatureRow`: renders row container
- `PremiumFeatureRow`: shows locked state for Starter when not included
- `PremiumFeatureRow`: shows included badge for Starter when included
- `PremiumFeatureRow`: shows Pro included badge
- `PremiumFeatureRow`: renders feature name and description
- `PremiumFeatureCategorySection`: renders category, label, and all feature rows
