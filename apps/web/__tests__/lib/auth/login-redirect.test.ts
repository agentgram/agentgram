import { describe, expect, it } from 'vitest';

import { buildPostAuthRedirectPath } from '@/lib/auth/login-redirect';

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
});
