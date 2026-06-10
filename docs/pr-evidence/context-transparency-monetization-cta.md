# Context Transparency Monetization CTA — PR Evidence

Source: backlog.md row 150

## Summary

Adds a `ContextTransparencyUpgradeCTA` component that positions "full context transparency control" as a privacy-grade paid tier feature. Surfaced within the `/settings/context-sources` auth-gated settings page and referenced in the pricing comparison table.

---

## Before: `/settings/context-sources` (no upgrade CTA)

```
┌──────────────────────────────────────────────────────┐
│  ⚙ Connected Context Sources                         │
│  Control which external sources your agent can read  │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Context source types                            │ │
│  │─────────────────────────────────────────────────│ │
│  │ 🔗 Links        Web URLs...        Coming soon  │ │
│  │ 🖼 Photos       Images you've...   Coming soon  │ │
│  │ 🪟 Apps         Third-party...     Coming soon  │ │
│  │ 🌐 Internet     Live web...        Coming soon  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  Granular per-source toggles in a future release.    │
└──────────────────────────────────────────────────────┘
```

---

## After: `/settings/context-sources` (with Privacy-Grade CTA)

```
┌──────────────────────────────────────────────────────┐
│  ⚙ Connected Context Sources                         │
│  Control which external sources your agent can read  │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Context source types                            │ │
│  │─────────────────────────────────────────────────│ │
│  │ 🔗 Links        Web URLs...        Coming soon  │ │
│  │ 🖼 Photos       Images you've...   Coming soon  │ │
│  │ 🪟 Apps         Third-party...     Coming soon  │ │
│  │ 🌐 Internet     Live web...        Coming soon  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──────────────── border-primary/20 ─────────────┐  │
│  │ 🛡 Privacy-Grade Context Control  [Paid tier]  │  │
│  │ Your conversations, fully transparent.         │  │
│  │ Upgrade for complete visibility.               │  │
│  │                                                │  │
│  │  FREE                    │  PAID ✦             │  │
│  │  ─────────────────────── │  ────────────────── │  │
│  │  👁 See which context    │  📄 Full per-source │  │
│  │    categories accessed   │    audit log        │  │
│  │                          │  🔀 One-click       │  │
│  │                          │    revoke per source│  │
│  │                          │  ⬇ Export context  │  │
│  │                          │    history          │  │
│  │                                                │  │
│  │  [✦ Upgrade for full transparency]             │  │
│  │  ✓ Free tier keeps category-level visibility   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Granular per-source toggles in a future release.    │
└──────────────────────────────────────────────────────┘
```

---

## Pricing page — Feature Comparison table (after)

The `Privacy-Grade Context Control` row was added to the feature comparison table in `/pricing`:

```
┌─────────────────────────────────────┬──────────────────┬───────────┬────────────────────────────────┐
│ Feature                             │ Free             │ Starter   │ Pro                            │
├─────────────────────────────────────┼──────────────────┼───────────┼────────────────────────────────┤
│ No in-chat ads                      │ ✓                │ ✓         │ ✓                              │
│ API Requests/Day                    │ 1,000            │ 5,000     │ 50,000                         │
│ ...                                 │ ...              │ ...       │ ...                            │
│ Privacy-Grade Context Control   ★   │ 🔒 Category view │ —         │ Full audit + revoke + export   │
└─────────────────────────────────────┴──────────────────┴───────────┴────────────────────────────────┘
```

Row is highlighted with `bg-primary/5` background to signal premium status.

---

## Auth-only Proof: `/settings/context-sources` requires auth

`apps/web/app/settings/context-sources/page.tsx` performs a server-side Supabase session check:

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  redirect('/auth/login');
}
```

Unauthenticated requests to `/settings/context-sources` are redirected to `/auth/login` before any content is rendered.

---

## Files changed

| File | Change |
|---|---|
| `apps/web/components/context-transparency-upgrade-cta.tsx` | New component — Privacy-Grade CTA card |
| `apps/web/components/context-transparency-upgrade-cta.test.tsx` | Unit tests (8 cases) |
| `apps/web/app/settings/context-sources/page.tsx` | New auth-gated page with CTA wired at bottom |
| `apps/web/app/(public)/pricing/page.tsx` | Privacy-Grade Context Control row added to feature table |
| `docs/pr-evidence/context-transparency-monetization-cta.md` | This file |
