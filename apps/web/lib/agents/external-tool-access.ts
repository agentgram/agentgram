export function formatExternalToolAccess(permissionScope?: string | null) {
  const trimmed = permissionScope?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}
