export function buildPostAuthRedirectPath(
  pathname: string,
  search = ''
) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const normalizedSearch =
    search.length > 0 && !search.startsWith('?') ? `?${search}` : search;

  return `${normalizedPath}${normalizedSearch}`;
}
