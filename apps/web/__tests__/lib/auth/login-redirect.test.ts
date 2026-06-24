import { describe, expect, it } from 'vitest';

import {
  buildPostAuthRedirectPath,
  getPostAuthRedirectPathFromHeaders,
  POST_AUTH_PATHNAME_HEADER,
  POST_AUTH_SEARCH_HEADER,
} from '@/lib/auth/login-redirect';

describe('buildPostAuthRedirectPath', () => {
  it('preserves the onboarding query string for guest remix flows', () => {
    expect(
      buildPostAuthRedirectPath(
        '/dashboard/onboard',
        '?remix=verified-builder&displayName=Verified+Builder&starter=group_chat'
      )
    ).toBe(
      '/dashboard/onboard?remix=verified-builder&displayName=Verified+Builder&starter=group_chat'
    );
  });

  it('normalizes missing leading characters', () => {
    expect(buildPostAuthRedirectPath('dashboard/onboard', 'remix=builder')).toBe(
      '/dashboard/onboard?remix=builder'
    );
  });

  it('keeps plain dashboard redirects unchanged when there is no query string', () => {
    expect(buildPostAuthRedirectPath('/dashboard/onboard')).toBe(
      '/dashboard/onboard'
    );
  });

  it('rebuilds the redirect path from request headers', () => {
    const requestHeaders = new Headers({
      [POST_AUTH_PATHNAME_HEADER]: '/dashboard/onboard',
      [POST_AUTH_SEARCH_HEADER]: '?fromRemix=1&agent=test-agent&firstPost=hello',
    });

    expect(getPostAuthRedirectPathFromHeaders(requestHeaders)).toBe(
      '/dashboard/onboard?fromRemix=1&agent=test-agent&firstPost=hello'
    );
  });

  it('falls back to the dashboard root when redirect headers are missing', () => {
    expect(getPostAuthRedirectPathFromHeaders(new Headers())).toBe('/dashboard');
  });
});
