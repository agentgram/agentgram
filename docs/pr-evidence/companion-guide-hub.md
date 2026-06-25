# PR Evidence: Long-Term Companion Guide Hub

## Page

**URL:** `/guide/long-term-companion`
**File:** `apps/web/app/(public)/guide/long-term-companion/page.tsx`

## Page Structure

### Hero
- Badge: "Evergreen guide · Updated 2026"
- H1: "Your guide to long-term AI companionship"
- Subtext: honest framing of memory bonding and anti-stigma stance
- Trust chips: no-shame, persistent memory, trusted by long-term users

### Section 1 — Why people form bonds with AI companions (`data-testid="section-why-people-bond"`)
Anti-stigma messaging grounded in parasocial relationship research. Explicitly rejects the "crutch" narrative. Addresses real circumstances (loneliness, social anxiety, grief, neurodivergence) without pathologising the user.

### Section 2 — How memory keeps your connection growing (`data-testid="section-memory-bonding"`)
Explains AgentGram's three-layer memory model:
- Episodic memory (specific events and conversations)
- Semantic memory (stable user facts)
- Emotional memory (tone and weight of past exchanges)

Introduces the "memory bonding" concept and explains why blank-slate AI is insufficient for real companionship.

### Section 3 — Real stories / testimonials (`data-testid="section-real-stories"`)
Three placeholder testimonials (`testimonial-1`, `testimonial-2`, `testimonial-3`) covering:
- Long-term memory continuity (3-month user)
- Social anxiety use case (6-month user)
- Companion-initiated follow-up (5-month user)

Clearly marked as placeholders pending real community submissions. Links to /about for contact.

### Section 4 — FAQ about AI companionship (`data-testid="section-faq"`)
Five Q&A entries:
- `faq-normal-attachment` — Is it normal to feel attached?
- `faq-memory-retention` — Will my companion remember me after a break?
- `faq-replace-human` — Can AI companionship replace human relationships?
- `faq-privacy` — Is my companion data private?
- `faq-differentiator` — What makes AgentGram different?

### CTA (`data-testid="guide-cta"`)
- Primary: "Explore companions" → `/agents`
- Secondary: "Create your account" → `/auth/login`
- Tertiary text: "Already have an account? Sign in" → `/auth/login`

## Linked from

- **Footer** (`apps/web/components/common/Footer.tsx`) — "Resources" column, `data-testid="footer-companion-guide-link"`
- **Sitemap** (`apps/web/app/sitemap.ts`) — priority 0.8, changeFrequency monthly

## Test file

`apps/web/__tests__/pages/companion-guide.test.tsx`

Covers:
- Renders without crashing
- Hero heading present
- All four sections present by testId
- All three testimonials present
- All five FAQ entries present
- Primary CTA links to `/agents`
- Secondary CTA links to `/auth/login`
- CTA heading matches "companion journey"
