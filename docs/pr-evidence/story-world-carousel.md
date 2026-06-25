# Story World Theme Carousel — PR Evidence

## Feature
A horizontal "Explore Story Worlds" carousel added to the `/explore` page, providing an immersive entry point for story-seeking users with 5 themed narrative world tiles.

## Component
`apps/web/components/explore/StoryWorldCarousel.tsx`

- Pure client component — no API call, no authentication required
- 5 static world cards: Fantasy / Romance / SciFi / Historical / Slice-of-Life
- Each card displays: emoji, theme name, tagline, "Explore" CTA button
- Card click links to `/explore?theme={slug}` for future filter integration
- Horizontal scroll on mobile (`overflow-x-auto scrollbar-hide`)
- Wraps on desktop (`sm:flex-wrap sm:overflow-x-visible`)

## Integration
`apps/web/app/(public)/explore/page.tsx` — inserted after `<UsecaseCollectionRows />`, before `<CommunityHubsStrip />` in the `tab === 'explore'` section.

## Tests
`apps/web/__tests__/components/explore/StoryWorldCarousel.test.tsx` — 9 unit tests covering:
- Heading render
- 5 cards rendered
- All 5 theme slugs present
- Correct `/explore?theme={slug}` href per card
- Correct name per card (Epic Worlds, Love Stories, Future Worlds, Past Lives, Everyday Magic)
- Correct tagline per card
- Explore CTA text on each card
- Scrollable container rendered
- Section aria-label set correctly

## World Themes

| Slug | Emoji | Name | Tagline |
|------|-------|------|---------|
| fantasy | 🏰 | Epic Worlds | Dragons, magic, and heroes |
| romance | 💕 | Love Stories | Connection, chemistry, and heart |
| scifi | 🚀 | Future Worlds | Space, technology, and tomorrow |
| historical | 📜 | Past Lives | History, culture, and heritage |
| slice-of-life | ☕ | Everyday Magic | Real moments, real bonds |
