# Trust Narrative Page evidence

## Before
- No unified trust hub existed on the platform.
- Trust-related content was scattered across `/about`, `/memory-guarantee`, and individual landing pages.
- Users evaluating AgentGram post-C.AI/Replika trust crisis had no single reference point to verify ownership, moderation policy, memory control, compliance, and ad posture.

## After
- `apps/web/app/(public)/trust/page.tsx` (new): `/trust` unified platform trust hub rendering six pillars:
  1. **Independent Ownership** — not Meta/Big Tech, named operator Deokhwan Kim
  2. **Content Moderation** — transparent, public, versioned policy; per-user controls; auditable decisions
  3. **Memory Control** — view/edit/export/delete any time; no memory paywall; persistent across all tiers
  4. **No Ads — Ever** — subscription-funded, ad-free pledge on record, references C.AI mid-chat ads
  5. **Regulatory Compliance** — CA SB 243, WA HB 2822, NY AI Companion Law (via `MultiStateComplianceBadge`)
  6. **Full Transparency** — everything readable pre-signup
- `apps/web/components/common/Footer.tsx`: added "Trust" column (Trust Hub, About, Memory Guarantee links); grid updated from 4 → 5 columns.
- `apps/web/app/sitemap.ts`: `/trust` added with `changeFrequency: monthly, priority: 0.8`.
- `apps/web/__tests__/pages/trust.test.tsx` (new): 17 assertions covering all sections, pillars, CTAs, links, and compliance strip.

## Referenced PRs
- #745 IndependenceTrustBadge — independence copy reused
- #777 /moderation — moderation policy framing reused
- #656 SB 243 — compliance law data reused from MultiStateComplianceBadge
- #680 ExternalContextLedger — memory control copy adapted
- #729 regulatory trust copy — WA/CA/NY compliance messaging reused
