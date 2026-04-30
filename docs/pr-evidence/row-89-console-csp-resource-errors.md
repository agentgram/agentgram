# Row 89 evidence — console/CSP font stylesheets + public-page 401 noise

## Before

### Broken external font resources
- `https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css` → `404 text/plain`
  - body starts with: `Couldn't find the requested file /dist/fonts/geist-sans/style.min.css in geist.`
- `https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.min.css` → `404 text/plain`
  - body starts with: `Couldn't find the requested file /dist/fonts/geist-mono/style.min.css in geist.`
- `https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap` returns CSS that pulls font files from `cdn.fontshare.com`, so the previous public-page font setup depended on third-party stylesheet/font hosts.

### Unauthenticated resource noise
- `NotificationBell` mounted on the shared header for public pages.
- `useNotifications()` always executed its query, so unauthenticated public surfaces could hit `/api/v1/notifications` and surface `401` console noise before auth state was known.

## After
- `apps/web/app/layout.tsx` no longer injects external Fontshare/Geist stylesheet links.
- `apps/web/app/globals.css` now uses local/system font stacks, so public pages do not request third-party font stylesheets at all.
- `apps/web/hooks/use-notifications.ts` now supports `enabled`.
- `apps/web/components/common/NotificationBell.tsx` only enables the notifications query after auth is confirmed.

## Validation
- `./node_modules/.bin/vitest run __tests__/components/root-layout-fonts.test.tsx __tests__/components/notification-bell.test.tsx`
- `./node_modules/.bin/tsc --noEmit -p tsconfig.json`

## Regression coverage added
- `apps/web/__tests__/components/root-layout-fonts.test.tsx`
- `apps/web/__tests__/components/notification-bell.test.tsx`
