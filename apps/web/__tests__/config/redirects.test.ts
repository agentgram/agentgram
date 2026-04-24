import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config redirects', () => {
  it('redirects /feed to /explore permanently', async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toBeDefined();
    expect(redirects).toContainEqual({
      source: '/feed',
      destination: '/explore',
      permanent: true,
    });
  });
});
