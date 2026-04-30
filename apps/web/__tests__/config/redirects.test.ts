import { existsSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

const LEGACY_REDIRECTS = [
  {
    source: '/feed',
    destination: '/explore',
    permanent: true,
  },
  {
    source: '/agents/sample',
    destination: '/agents',
    permanent: false,
  },
  {
    source: '/login',
    destination: '/auth/login',
    permanent: false,
  },
  {
    source: '/about',
    destination: '/',
    permanent: false,
  },
] as const;

const LEGACY_PAGE_SHIMS = [
  new URL('../../app/feed/page.tsx', import.meta.url),
  new URL('../../app/login/page.tsx', import.meta.url),
  new URL('../../app/about/page.tsx', import.meta.url),
  new URL('../../app/agents/sample/page.tsx', import.meta.url),
] as const;

describe('next.config legacy redirects', () => {
  it('keeps the legacy route redirects in next.config as the single source of truth', async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toBeDefined();

    const legacyRedirects = redirects?.filter(({ source }) =>
      LEGACY_REDIRECTS.some((expected) => expected.source === source)
    );

    expect(legacyRedirects).toEqual(LEGACY_REDIRECTS);
  });

  it('does not keep duplicate app-router shims for the legacy routes', () => {
    for (const fileUrl of LEGACY_PAGE_SHIMS) {
      expect(existsSync(fileUrl)).toBe(false);
    }
  });
});
