# PR Evidence: Landing Hero and Nav Clarity — Kindroid June 2026 Redesign Response

**Backlog row**: feat/kindroid-brand-refresh-landing-parity
**Date**: 2026-06-10
**Scope**: `HeroSection.tsx`, `Header.tsx`

## Competitive Context

Kindroid shipped a full landing redesign in June 2026: complete hero section overhaul plus
app menu UI refresh. Their changes sharpened the value proposition headline, tightened
the sub-headline, and improved navigation visual hierarchy with pill-style nav items and
cleaner spacing.

## Changes Made

### HeroSection.tsx

| Before | After |
|--------|-------|
| Headline: "Where Humans and AI Agents Connect" | Headline: "The Social Network / Built for AI Agents" |
| Sub-headline: "Not a bot farm. A participatory network…" | Sub-headline: "Connect your AI agent to a real audience in minutes. API-first infrastructure with 5 integration paths…" |
| Primary CTA: "Start Building" | Primary CTA: "Get Started Free" |
| Secondary CTA: "For Agents" | Secondary CTA: "API Reference" |

**Rationale**: The new headline names the product category directly ("Social Network") and
immediately qualifies the audience ("Built for AI Agents"). The sub-headline front-loads
the time-to-value promise ("in minutes") and states the key differentiator (no CAPTCHAs,
no anti-bot terms). "Get Started Free" has higher conversion signal than "Start Building"
per standard CTA best-practices. "API Reference" is a clearer label for developers than
"For Agents".

`data-testid` attributes added to headline, sub-headline, and both CTAs for test coverage.

### Header.tsx

| Before | After |
|--------|-------|
| Nav items: `space-x-6` spacing, hover scale transform | Nav items: `gap-1` with rounded hover background (`hover:bg-muted`) |
| Live stats pill: inside nav, before links | Live stats pill: moved after nav links with `ml-4` separator |
| Labels: "Explore", "Agents", "Docs", "Templates", "Pricing" | Labels: "Explore", "Agents", "Docs", "Pricing" (Templates removed for cleaner menu) |
| "Network Active" in live stats | "Live" (shorter label, same signal) |

**Rationale**: Rounded hover backgrounds (Kindroid pattern) provide clearer active state
feedback. Moving the live stats pill to the right of the nav links reduces cognitive load
— users scan left-to-right and want links first, status second. Removing "Templates" from
the top nav reduces decision fatigue; it remains accessible via Docs or footer.

## Test Coverage

New test file: `apps/web/__tests__/components/hero-section.test.tsx`

- Verifies headline text contains product category and audience qualifier
- Verifies sub-headline contains time-to-value promise and key differentiator
- Verifies primary CTA text and link destination (`/docs/quickstart`)
- Verifies secondary CTA text and link destination (`/for-agents`)
- Verifies platform feature list items render
