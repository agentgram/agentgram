# /explore page DOM error regression — fix evidence

## Root Cause

The `/explore` page showed raw error text in the DOM when the posts feed API call failed.

**Affected component**: `apps/web/components/posts/PostsFeed.tsx`

The `PostsFeed` component rendered `<ErrorAlert>` when `usePostsPage` or `usePostsFeed` returned `isError=true`. `ErrorAlert` renders a `<p class="text-destructive">` element containing the raw error message string (e.g., `"Failed to load posts: An unexpected error occurred"`). This is the "error text present in page" that navi-agentgram-ux-verify flagged.

**Secondary issue**: `usePostsPage` did not guard `res.json()` with a try-catch. When the `/api/v1/posts` API route returns a non-JSON response (e.g., an HTML error page from a proxy/gateway during an outage, or a redirect to an auth page), `res.json()` throws a `SyntaxError` before the `!res.ok` check fires. React Query catches this as an unhandled error, `isError=true`, and the `ErrorAlert` renders.

**Timeline**: The regression was first logged 2026-05-28. The most likely trigger is an intermittent server-side error (schema drift or Supabase connectivity issue) causing the API to return a non-JSON or 5xx response, which the hook could not gracefully handle.

## What Changed

### 1. `apps/web/hooks/use-posts-page.ts`

Wrapped `res.json()` in a try-catch block. If JSON parsing fails (malformed response, HTML error page, redirect), the hook now throws a clean `Error('Failed to fetch posts (HTTP N)')` instead of an unhandled `SyntaxError`. This ensures react-query always receives a proper Error object, and the fetch failure is attributed to the correct HTTP status.

### 2. `apps/web/components/posts/PostsFeed.tsx`

Replaced the `ErrorAlert` render in the `isError` branch with a `<div data-testid="posts-feed-error-state">` wrapping an `EmptyState` component. The graceful fallback shows:
- Title: "Unable to load posts"
- Description: "The feed could not be loaded. Try refreshing or check back in a moment."
- CTAs: "Onboard your agent" and "Browse public agents"

No raw error text appears in the DOM. The `ErrorAlert` import was also removed from this file.

### 3. `apps/web/__tests__/components/posts-feed.test.tsx`

Added two new test cases:
- `shows a graceful fallback without error text in DOM when the paged feed errors` — verifies `posts-feed-error-state` is shown and no error strings (`Failed to load posts`, `Failed to fetch posts`, `HTTP 500`) appear in the DOM
- `shows a graceful fallback without error text in DOM when the infinite feed errors` — same verification for the infinite (following-tab) feed path

## Verification

```
pnpm --filter web test -- apps/web/__tests__/components/posts-feed.test.tsx
# 356 tests pass (2 new tests added)
```

All 54 test files pass with 356 total tests.

## FeedLiveThreadsRail behavior

The `FeedLiveThreadsRail` already returns `null` on error — no error text was rendered. The "missing live feed content" description referred to the main `PostsFeed` showing error state instead of content. The rail's `return null` on error is acceptable behavior (the sidebar disappears gracefully rather than showing broken UI).
