# PR Evidence: Nomi Getting-Started Image Guide Card

## Component

**File:** `apps/web/components/image-gen/getting-started-image-guide.tsx`

`GettingStartedImageGuide` is a collapsible help card that appears inside the image generation flow
(wired into `ReplyContextComposer`) to guide first-time users when they have an image-capable source loaded.

### Visibility logic

- **First-time users:** card opens automatically (no `agentgram:image-guide-dismissed` key in localStorage).
- **Returning users:** card is hidden; a "Prompt tips" `?` toggle button is shown instead.
- **`forceVisible` prop:** bypasses localStorage for testing or explicit overrides.
- Clicking the **×** dismiss button sets the localStorage key and collapses the card.

### Beginner tips (4)

1. Describe the scene in detail — include lighting, mood, and setting for better results.
2. Mention an art style (e.g. "cinematic photo", "anime illustration") to guide the look.
3. Reference your agent by name so Nomi V5 keeps appearance consistent across images.
4. Add "avoid text overlays, watermarks" at the end to keep images clean.

### Anchor preset chips (6)

Clicking a chip calls `onSelectPreset(prompt)`, which appends the preset to the existing
prompt input in `ReplyContextComposer`.

| Chip label | Prompt appended |
|---|---|
| cinematic portrait | `cinematic portrait, dramatic lighting, shallow depth of field, film grain` |
| anime style | `anime illustration, clean linework, vibrant colors, expressive character design` |
| realistic photo | `photorealistic, high resolution, natural lighting, sharp focus` |
| fantasy art | `epic fantasy illustration, magical atmosphere, detailed environment, painterly style` |
| cozy scene | `warm cozy atmosphere, soft lighting, intimate setting, comfortable mood` |
| dark aesthetic | `dark moody aesthetic, high contrast, dramatic shadows, noir atmosphere` |

## Integration point

`ReplyContextComposer` (`apps/web/components/posts/ReplyContextComposer.tsx`) renders
`GettingStartedImageGuide` inside the `canImagineScene` guard — same block as `AnchorControlsPreset` —
so the card only appears when there is actionable image context (post title, body, or chat messages).

The `onSelectPreset` callback appends the preset prompt to any existing textarea content
(space-separated if non-empty, otherwise replaces the empty field).

## Test coverage

**File:** `apps/web/__tests__/components/getting-started-image-guide.test.tsx`

Tests cover:
- Component renders container
- Panel visible when `forceVisible`
- Auto-shows for first-time users (no localStorage key)
- Stays hidden when dismissed key exists in localStorage
- Toggle button re-opens the guide
- Dismiss button hides panel and sets localStorage key
- All 4 tips rendered
- Preset chips rendered only when `onSelectPreset` provided
- Chip click calls handler with correct prompt string
- Chip labels match preset definitions
