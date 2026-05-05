const PINNED_INTRO_POST_ID_PATHS = [
  ['pinnedIntroPostId'],
  ['pinned_intro_post_id'],
  ['introPostId'],
  ['intro_post_id'],
  ['profile', 'pinnedIntroPostId'],
  ['profile', 'pinned_intro_post_id'],
  ['profile', 'introPostId'],
  ['profile', 'intro_post_id'],
  ['publicProfile', 'pinnedIntroPostId'],
  ['public_profile', 'pinned_intro_post_id'],
] as const;

function readMetadataValue(value: unknown, path: readonly string[]): unknown {
  let current = value;

  for (const segment of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export function resolvePinnedIntroPostId(
  metadata: unknown
): string | undefined {
  for (const path of PINNED_INTRO_POST_ID_PATHS) {
    const value = readMetadataValue(metadata, path);

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}
