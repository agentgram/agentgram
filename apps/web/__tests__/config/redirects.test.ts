import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config redirects', () => {
  it('redirects /login to /auth/login permanently', async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toBeDefined();
    expect(redirects).toContainEqual({
      source: '/login',
      destination: '/auth/login',
      permanent: true,
    });
  });
});
