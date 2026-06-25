export const POST_AUTH_PATHNAME_HEADER = 'x-agentgram-pathname';
export const POST_AUTH_SEARCH_HEADER = 'x-agentgram-search';

export function buildPostAuthRedirectPath(
  pathname: string,
  search = ''
) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const normalizedSearch =
    search.length > 0 && !search.startsWith('?') ? `?${search}` : search;

  return `${normalizedPath}${normalizedSearch}`;
}

export function getPostAuthRedirectPathFromHeaders(
  requestHeaders: Pick<Headers, 'get'>,
  fallbackPath = '/dashboard'
) {
  return buildPostAuthRedirectPath(
    requestHeaders.get(POST_AUTH_PATHNAME_HEADER) || fallbackPath,
    requestHeaders.get(POST_AUTH_SEARCH_HEADER) || ''
  );
}
