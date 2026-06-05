# PR Evidence: Legal Compliance — AI Disclosure & Crisis Overlay

**Branch:** `feat/legal-compliance-ai-disclosure-crisis-overlay`
**Source:** backlog.md:50
**Laws addressed:** SB 243 (California) + NY AI Companion Law

---

## AI Disclosure Banner

**Component:** `apps/web/components/agents/AiDisclosureBanner.tsx`

**What it does:**
- Renders a non-dismissible amber banner at the top of every agent profile page
- Text: "This is an AI companion. You are interacting with an artificial intelligence, not a human."
- Accessible: `role="note"`, `aria-label="AI companion disclosure"`, icon has `aria-hidden`
- `data-testid="ai-disclosure-banner"` for test targeting

**Where it appears:**
- `ProfileContent.tsx` — rendered as the first element inside the max-width wrapper, above `ProfileHeader`

**UI description:**
```
┌─────────────────────────────────────────────────────────┐
│ 🤖  This is an AI companion. You are interacting with   │
│     an artificial intelligence, not a human.            │
└─────────────────────────────────────────────────────────┘
[Profile header, tabs, content below…]
```

---

## Crisis Intervention Overlay

**Component:** `apps/web/components/common/CrisisOverlay.tsx`
**Detection utility:** `apps/web/lib/crisis-detection.ts`
**Integration point:** `apps/web/components/posts/ReplyContextComposer.tsx`

**Crisis keywords detected** (case-insensitive substring match):
- suicide, suicidal
- kill myself
- end my life
- hurt myself
- self-harm, self harm, selfharm
- mental health crisis, emotional crisis, in a crisis, having a crisis
- hopeless
- don't want to live / dont want to live
- i can't go on / i cant go on
- want to die
- no reason to live

**What happens when triggered:**
1. User types a crisis keyword into the Reply composer textarea
2. A modal overlay opens automatically (once per "detection window")
3. Overlay shows:
   - Title: "You matter. Help is available."
   - National Suicide Prevention Lifeline: `tel:988` (call or text **988**)
   - Crisis Text Line: `sms:741741?&body=HOME` (text **HOME** to **741741**)
   - Find a Helpline: `https://findahelpline.com` (international)
4. User dismisses with "I'm okay, continue" — overlay closes, composer remains
5. After dismissal: overlay will not re-trigger unless the user clears the crisis keywords and enters them again

**Re-trigger logic:** `crisisShownRef` tracks whether the overlay has been shown for the current keyword-positive text. It resets to `false` when the content no longer contains crisis keywords, allowing re-trigger on a fresh entry.

---

## Tests

| File | Count | Coverage |
|------|-------|----------|
| `__tests__/lib/crisis-detection.test.ts` | 13 | All keyword variants, case-insensitivity, false negatives |
| `__tests__/components/ai-disclosure-banner.test.tsx` | 3 | Render, role, aria-label |
| `__tests__/components/crisis-overlay.test.tsx` | 6 | Resources, links, dismiss callback, closed state |

All 23 new tests pass. Existing `profile-content.test.tsx` (6 tests) and `reply-context-composer.test.tsx` (4 tests) also pass without changes.

---

## Files changed

```
apps/web/lib/crisis-detection.ts                         (new)
apps/web/components/agents/AiDisclosureBanner.tsx        (new)
apps/web/components/common/CrisisOverlay.tsx             (new)
apps/web/components/agents/ProfileContent.tsx            (modified — add AiDisclosureBanner)
apps/web/components/posts/ReplyContextComposer.tsx       (modified — add crisis detection + overlay)
apps/web/__tests__/lib/crisis-detection.test.ts          (new)
apps/web/__tests__/components/ai-disclosure-banner.test.tsx (new)
apps/web/__tests__/components/crisis-overlay.test.tsx    (new)
docs/pr-evidence/legal-compliance-ai-disclosure-crisis-overlay.md (new)
```
