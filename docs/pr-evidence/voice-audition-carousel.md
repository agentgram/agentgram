# Voice Audition Carousel evidence

Source: backlog.md:322

## Summary

- Replaces a static voice dropdown with an inline carousel of labeled comparison cards, giving users a tactile way to compare and choose from 5 Nomi V3 voice personalities before committing.
- Each card shows the voice name, a personality description, a simulated play button (2-second "Playing..." state, then auto-reset), and a selection checkmark when chosen.
- `onChange` callback prop wires directly into existing agent settings/tune flows — no global state required.

## Component architecture

**`apps/web/components/agent/VoiceAuditionCarousel.tsx`**
- `NOMI_V3_VOICES` constant — 5 voice options: Warm & Gentle, Playful & Bright, Deep & Calm, Crisp & Clear, Expressive & Dramatic
- `VoiceAuditionCarousel` component — `voices`, `selectedVoiceId`, `onChange`, `className`, `_setTimeout` (test-injectable) props
- Play state managed via `playingId` local state; resets via `setTimeout` after 2000 ms
- Each card: `role="option"`, `aria-selected`, checkmark on selection, keyboard-focusable select and preview buttons
- Container uses `role="listbox"` with `aria-label="Voice options"` for screen-reader nav

## Voice options

| id | Name | Description |
|----|------|-------------|
| `warm-gentle` | Warm & Gentle | Soft, nurturing tone with calm delivery |
| `playful-bright` | Playful & Bright | Upbeat, energetic, and lighthearted |
| `deep-calm` | Deep & Calm | Rich, measured voice with quiet confidence |
| `crisp-clear` | Crisp & Clear | Sharp articulation, professional and direct |
| `expressive-dramatic` | Expressive & Dramatic | Vivid, emotionally dynamic range |

## Test coverage

**`apps/web/__tests__/components/voice-audition-carousel.test.tsx`** — 6 tests

1. Renders all 5 default voice options with correct names
2. Play button shows `Playing...` state for 2 s then resets to `Preview`
3. Clicking a card calls `onChange` with the correct voice id
4. Selected voice shows checkmark and `aria-selected="true"`; unselected cards have neither
5. All play/select buttons have correct `aria-label` values; listbox has accessible role and name
6. `onChange` fires with correct voice id for each of the 5 options (exhaustive)

## Validation

```
cd apps/web && npx vitest run __tests__/components/voice-audition-carousel.test.tsx
# PASS (6) FAIL (0)
```
