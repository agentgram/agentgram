# MIT Breakthrough Press Badge — PR Evidence

**Backlog row 197 | tag: ux | priority: P3**

## Component

`apps/web/components/home/MITBreakthroughBadge.tsx`

A trust-signal strip styled consistently with `AdFreePledgeStrip` and `ContentPermanencePledgeStrip`. Blue color palette (border-blue-500/20, bg-blue-500/5) to visually distinguish it as press/recognition rather than a pledge.

### Content displayed

- Award icon (lucide-react)
- "MIT Technology Review" — linked to `https://www.technologyreview.com` (homepage, no fabricated article URL)
- "10 Breakthrough Technologies 2026 — AI Companions"
- "Market validation: $49B → $552B AI companion market projection"

## Placement

1. **Landing page** (`apps/web/app/(public)/page.tsx`): inserted between `AdFreePledgeStrip` and `ContentPermanencePledgeStrip`, forming a cluster of trust signals immediately below the stats bar.

## Tests

`apps/web/__tests__/components/mit-breakthrough-badge.test.tsx` — 5 cases:

1. Renders with correct `data-testid`
2. Displays MIT Technology Review name and "10 Breakthrough Technologies 2026" text
3. Displays the `$49B → $552B` market stat
4. Link points to `https://www.technologyreview.com` with `target="_blank"` and `rel="noopener noreferrer"`
5. Section has `aria-label="MIT Technology Review recognition"`
