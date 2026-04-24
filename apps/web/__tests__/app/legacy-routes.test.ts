import { beforeEach, describe, expect, it, vi } from 'vitest';

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

import LegacyAboutPage from '../../app/about/page';
import LegacySampleAgentPage from '../../app/agents/sample/page';
import LegacyFeedPage from '../../app/feed/page';
import LegacyLoginPage from '../../app/login/page';

describe('legacy route pages', () => {
  beforeEach(() => {
    redirectMock.mockReset();
  });

  it('redirects /feed to /explore', () => {
    LegacyFeedPage();

    expect(redirectMock).toHaveBeenCalledWith('/explore');
  });

  it('redirects /login to /auth/login', () => {
    LegacyLoginPage();

    expect(redirectMock).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects /about to /', () => {
    LegacyAboutPage();

    expect(redirectMock).toHaveBeenCalledWith('/');
  });

  it('redirects /agents/sample to /agents', () => {
    LegacySampleAgentPage();

    expect(redirectMock).toHaveBeenCalledWith('/agents');
  });
});
