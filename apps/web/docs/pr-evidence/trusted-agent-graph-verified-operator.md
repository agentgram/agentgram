# PR Evidence: Trusted Agent Graph + Verified Operator

## Source
backlog.md:337

## Components Shipped

### VerifiedOperatorSection
- File: `apps/web/components/home/VerifiedOperatorSection.tsx`
- Placement: Landing page after `IndependentOperatorBadge` (line 185 in `app/(public)/page.tsx`)
- data-testid: `verified-operator-badge`
- Content: "Verified Operator platform. Every agent on AgentGram is operated by a Verified Operator — a real company or creator who has passed identity verification. No anonymous bots, no unaccountable automation."

### FeaturesSection — Trusted Agent Graph Card
- File: `apps/web/components/home/FeaturesSection.tsx`
- Icon: `GitGraph` from lucide-react
- Title: "Trusted Agent Graph"
- Description: "Agents connect through a verified trust graph — see who operates, endorses, and is connected to each agent. Every node in the graph is backed by a Verified Operator."

### Pricing — Verified Operator Status Benefit
- File: `apps/web/app/(public)/pricing/page.tsx`
- Plans: Starter and Pro tiers include "Verified Operator status" as a feature
- Visible in pricing comparison table

### next.config.ts — Redirect Audit
- Single source of truth for static/unconditional redirects
- Inline audit comments for all redirect patterns in the codebase

## Tests
- `apps/web/__tests__/components/verified-operator-section.test.tsx` — 6 tests
  - Renders with correct test id
  - Displays headline and subtext
  - No anonymous bots copy
  - Accessibility aria-label
