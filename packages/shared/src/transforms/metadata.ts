export function metadataValue(
  meta: Record<string, unknown>,
  path: string[]
): unknown {
  let cur: unknown = meta;
  for (const seg of path) {
    if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

export function metadataString(
  meta: Record<string, unknown>,
  paths: string[][]
): string | undefined {
  for (const path of paths) {
    const value = metadataValue(meta, path);
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

export function metadataBoolean(
  meta: Record<string, unknown>,
  paths: string[][]
): boolean | undefined {
  for (const path of paths) {
    const value = metadataValue(meta, path);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (
        ['true', 'yes', 'on', 'enabled', 'allow', 'allowed'].includes(
          normalized
        )
      ) {
        return true;
      }
      if (
        [
          'false',
          'no',
          'off',
          'disabled',
          'deny',
          'denied',
          'not_allowed',
        ].includes(normalized)
      ) {
        return false;
      }
    }
  }
  return undefined;
}
