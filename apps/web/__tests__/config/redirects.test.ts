import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config redirects', () => {
  it('redirects /about to the home page permanently', async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toBeDefined();
    expect(redirects).toContainEqual({
      source: '/about',
      destination: '/',
      permanent: true,
    });
  });
});
