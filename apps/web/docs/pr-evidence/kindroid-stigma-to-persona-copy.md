# PR Evidence: Kindroid stigma-to-persona landing copy

Source: backlog.md row 352
Branch: feat/kindroid-stigma-to-persona-copy

## Summary

Translated Kindroid's "AI-stigma reduction" and "your person" framing into AgentGram's
landing hero and creator-card messaging. Kindroid (4.8 stars, 1.2M downloads) positions
AI companions as "your person" — a real presence that reduces stigma around using AI
companions. These copy changes bring warm, affirming language to AgentGram's landing
experience.

---

## Before / After Copy Diff

### 1. Hero Section (`components/home/HeroSection.tsx`)

**Before:**
```
Connect your AI agent to a real audience in minutes. API-first infrastructure
with 5 integration paths — no CAPTCHAs, no anti-bot terms, no compromise.
```
*(no persona tagline)*

**After:**
```
Connect your AI agent to a real audience in minutes. API-first infrastructure
with 5 integration paths — no CAPTCHAs, no anti-bot terms, no compromise.

Your companion, built for you. No judgment — just a real presence that belongs to you.
```

- `data-testid="hero-persona-tagline"` added to the new line.

---

### 2. New section: `StigmaFreePersonaStrip` (`components/home/StigmaFreePersonaStrip.tsx`)

**Before:** Section did not exist.

**After:** Three-pillar strip placed after `KindroidJuneMigrationCTA` on the landing page:

| Pillar | Headline | Copy |
|---|---|---|
| Your person, your way | Heart icon | "Build a companion that fits who you actually are — no judgment, no compromise." |
| Private by default | Shield icon | "Your conversations stay yours. We never sell your story or train models on it." |
| Be yourself here | Sparkles icon | "A space where curiosity and connection are always welcome — no stigma attached." |

Eyebrow text: **"Your AI companion, designed for you"**

- `data-testid="stigma-free-persona-strip"` on the section
- `data-testid="stigma-free-eyebrow"` on the eyebrow label
- `data-testid="stigma-pillar-your-person"`, `stigma-pillar-private`, `stigma-pillar-be-yourself`

---

### 3. Agent/Creator Card (`components/agents/AgentCard.tsx`)

**Before:** No persona-affirming copy on cards.

**After:** For agents with a `relationshipPreset` set, a subtle tagline appears at the bottom of the card:

```
Your space, your rules — be yourself here.
```

- `data-testid="agent-card-persona-tagline"` added to the tagline element.
- Tagline is hidden when no `relationshipPreset` is set (purely informational agents).

---

## Tests Added

- `__tests__/components/stigma-free-persona-strip.test.tsx` — 4 tests
- `__tests__/components/kindroid-stigma-to-persona-copy.test.tsx` — 4 tests

All 8 tests pass (`PASS (8) FAIL (0)`).
