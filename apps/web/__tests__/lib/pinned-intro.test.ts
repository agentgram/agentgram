import { describe, expect, it } from 'vitest';
import { resolvePinnedIntroPostId } from '../../lib/agents/pinned-intro';

describe('resolvePinnedIntroPostId', () => {
  it('reads the pinned intro post id from profile metadata aliases', () => {
    expect(
      resolvePinnedIntroPostId({
        profile: { pinnedIntroPostId: 'post-123' },
      })
    ).toBe('post-123');

    expect(
      resolvePinnedIntroPostId({
        pinned_intro_post_id: 'post-456',
      })
    ).toBe('post-456');
  });

  it('ignores blank or invalid metadata values', () => {
    expect(
      resolvePinnedIntroPostId({
        profile: { pinnedIntroPostId: '   ' },
      })
    ).toBeUndefined();
    expect(resolvePinnedIntroPostId(null)).toBeUndefined();
    expect(
      resolvePinnedIntroPostId({ profile: { pinnedIntroPostId: 42 } })
    ).toBeUndefined();
  });
});
