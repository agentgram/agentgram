# Narrative Arc Share Deeplink — PR Evidence

## Summary

Adds shareable deeplink URLs for multi-character narrative arc sessions. Extends PR #756 (`NarrativeArcConfig`) with social-sharing capability, mirroring Kindroid's story-sharing mechanics.

## Files Changed

| File | Change |
|------|--------|
| `apps/web/components/NarrativeArcShareButton.tsx` | New `NarrativeArcShareButton` component — clipboard copy + toast |
| `apps/web/components/ArcShareMetadata.tsx` | New `ArcShareMetadata` component — og:title / og:description meta tags |
| `apps/web/app/arc/share/route.ts` | New `GET /arc/share` route — validates arcId, redirects to `/chat` |
| `apps/web/__tests__/components/narrative-arc-share-button.test.tsx` | 11 unit tests for `NarrativeArcShareButton` |

## Before

- Narrative arc sessions launched via `NarrativeArcConfig` modal (PR #756).
- No mechanism for a user to share a link to a specific arc session or chapter.
- No `/arc/share` route existed.
- No OG meta tags for arc pages.

## After

### NarrativeArcShareButton

A small "Share arc" button renders wherever arc sessions are displayed. Clicking it:

1. Builds a deeplink: `https://agentgram.co/arc/share?arcId=<id>` (or `?arcId=<id>&chapter=<n>` when a chapter is active).
2. Writes the URL to the clipboard via `navigator.clipboard.writeText` (with `execCommand` fallback for older browsers).
3. Toggles label to "Link copied!" for 2 seconds, then resets.
4. Silently no-ops if clipboard is unavailable or arcId is empty.

```
┌────────────────────────┐
│  ↗  Share arc          │  (default state)
└────────────────────────┘

┌────────────────────────┐
│  ↗  Link copied!       │  (2 s after click)
└────────────────────────┘
```

### GET /arc/share Route

```
GET /arc/share?arcId=abc123&chapter=2
→ 302 /chat?arcId=abc123&chapter=2

GET /arc/share         (no arcId)
→ 400 { error: { code: 'INVALID_INPUT', message: 'arcId parameter is required' } }
```

No auth required on the redirect. The `/chat` destination handles authentication.

### ArcShareMetadata

Renders `<meta>` tags in the `<head>` of arc pages for social link previews:

```html
<meta property="og:title" content="Epic Quest Arc — Chapter 3 | AgentGram" />
<meta property="og:description" content="Join the multi-character narrative arc "Epic Quest Arc" at chapter 3. Continue the story on AgentGram." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Epic Quest Arc — Chapter 3 | AgentGram" />
<meta name="twitter:description" content="..." />
```

## Auth Gating

- `NarrativeArcShareButton`: client-side only, no auth required to generate/copy a link.
- `GET /arc/share`: public redirect route — no auth. The `/chat` destination enforces auth.
- `ArcShareMetadata`: static meta tags, no auth.

## Test Coverage

See `apps/web/__tests__/components/narrative-arc-share-button.test.tsx` (11 tests):

1. Renders the share button
2. Shows "Share arc" label by default
3. Calls clipboard.writeText with correct URL on click
4. Includes chapterIndex in URL when provided
5. Omits chapter param when chapterIndex is undefined
6. Shows "Link copied!" toast after successful copy
7. Reverts label back to "Share arc" after 2 s
8. Applies custom className to button
9. Does nothing when arcId is empty string
10. Handles clipboard error gracefully without throwing
11. Uses chapterIndex 0 correctly (not treated as falsy)
