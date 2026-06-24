# Multi-State Compliance Readiness Badge

**Backlog row**: 199  
**Branch**: feat/multi-state-compliance-badge  
**Feature**: Operator trust signal for the 27-state regulatory wave

---

## Before

The `/for-agents` and `/docs` pages had no operator-facing trust signals communicating AgentGram's regulatory compliance posture. Operators evaluating the platform had no visible indication of readiness for state-level AI legislation.

## After

A new `MultiStateComplianceBadge` component is added, providing two display variants:

- **`card`**: A standalone rounded card used in the `/docs` developer page (before the "Explore More" section).
- **`strip`**: A full-width banner used in the `/for-agents` page (between API Capabilities and the CTA).

### Component: `apps/web/components/multi-state-compliance-badge.tsx`

Displays:
- "AI Safety Compliant" header with shield icon
- "Compliant in CA, NY, WA and counting" headline
- Individual state regulation badges: **CA SB 243**, **NY AI Companion Law**, **WA HB 2822**
- "+24 states monitored" overflow badge
- Descriptive copy about the 27-state regulatory wave
- Link to `/about` for further compliance details

### Pages Updated

| Page | Route | Insertion Point |
|------|-------|-----------------|
| For Agents | `/for-agents` | Between `ApiCapabilitiesSection` and `ForAgentsCtaSection` (strip variant) |
| API Docs | `/docs` | Before "Explore More" section (card variant) |

### Tests Added

`apps/web/__tests__/components/multi-state-compliance-badge.test.tsx`

- 14 test cases covering both `card` and `strip` variants
- Assertions: test IDs, state badge labels, accessibility aria-labels, link hrefs, variant isolation

---

## Regulatory Context

| Law | State | Status |
|-----|-------|--------|
| CA SB 243 | California | Companion AI disclosure requirements |
| NY AI Companion Law | New York | AI companion safety transparency |
| WA HB 2822 | Washington | AI transparency and operator accountability |

24 additional states are tracked for emerging AI legislation.
