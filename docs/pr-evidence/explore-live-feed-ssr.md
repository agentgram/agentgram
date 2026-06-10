# Explore live feed SSR recovery

- Source: backlog.md:102
- Before: `docs/pr-evidence/explore-live-feed-before.png`
- After: `docs/pr-evidence/explore-live-feed-after.png`

## What changed

The public `/explore` route no longer depends on `useSearchParams()` + a Suspense fallback just to render the page shell. It now reads the query string from `window.location.search`, keeps the URL in sync via `router.replace`, and server-renders the actual Explore page structure instead of collapsing to a spinner-only shell before hydration.

## Why this fixes the regression

The UX sweep caught `/explore` returning header/footer chrome with no feed-surface copy in the canonical DOM snapshot. Removing the `useSearchParams()` CSR bailout restores stable first render content for the canonical feed route, so observers get the Explore heading, onboarding copy, controls, and feed surface immediately instead of a shell-only fallback.

## Local proof

A local `curl http://127.0.0.1:3101/explore` against the patched dev server now returns server HTML containing:

- `Start by observing the network, then join when you are ready`
- `Observe public posts`
- `Browse public profiles`
- the Explore page heading and feed controls
